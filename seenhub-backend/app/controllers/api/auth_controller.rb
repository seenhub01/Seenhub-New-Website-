class Api::AuthController < ApplicationController
  skip_before_action :authenticate_user!
  def register
    user = User.new(user_params)
    
    if user.save
      token = generate_token(user.id)
      render json: {
        success: true,
        token: token,
        expiresAt: 24.hours.from_now.to_i * 1000,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          printingCredits: user.printing_credits,
          role: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed') ? 'Corporate' : 'Individual',
          isCorporate: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed')
        }
      }, status: :created
    else
      render json: { success: false, message: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = generate_token(user.id)
      render json: {
        success: true,
        token: token,
        expiresAt: 24.hours.from_now.to_i * 1000,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          printingCredits: user.printing_credits || 0,
          role: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed') ? 'Corporate' : 'Individual',
          isCorporate: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed')
        }
      }, status: :ok
    else
      render json: { success: false, message: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def forgot_password
    user = User.find_by(email: params[:email])
    # Always return success to prevent email enumeration
    if user
      otp = rand(100_000..999_999).to_s
      user.update_columns(otp_code: otp, otp_expires_at: 15.minutes.from_now)
      UserMailer.forgot_password(user, otp).deliver_later rescue nil
    end
    render json: { success: true, message: 'If that email exists, a reset code has been sent.' }
  end

  def reset_password
    user = User.find_by(email: params[:email])
    unless user && user.otp_code.present? && user.otp_code == params[:otp].to_s
      return render json: { success: false, message: 'Invalid or expired reset code.' }, status: :unprocessable_entity
    end
    if user.otp_expires_at < Time.current
      return render json: { success: false, message: 'Reset code has expired. Please request a new one.' }, status: :unprocessable_entity
    end
    if user.update(password: params[:password], otp_code: nil, otp_expires_at: nil)
      render json: { success: true, message: 'Password updated successfully.' }
    else
      render json: { success: false, message: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def verify_otp
    user = User.find_by(email: params[:email])
    otp = params[:otp].to_s

    # Validate OTP against stored value and expiry
    valid = user &&
            otp.length == 6 &&
            user.otp_code.present? &&
            user.otp_code == otp &&
            user.otp_expires_at.present? &&
            user.otp_expires_at >= Time.current

    if valid
      user.update_columns(otp_code: nil, otp_expires_at: nil)
      token = generate_token(user.id)
      render json: {
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          printingCredits: user.printing_credits || 0,
          role: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed') ? 'Corporate' : 'Individual',
          isCorporate: (user.employment_status.to_s.downcase == 'corporate' || user.employment_status.to_s.downcase == 'employed')
        }
      }
    else
      render json: { success: false, message: 'Invalid or expired OTP.' }, status: :unauthorized
    end
  end

  def resend_otp
    user = User.find_by(email: params[:email])

    # Always return success to prevent email enumeration (Bug 4 fix)
    unless user
      return render json: { success: true, message: 'If that email exists, a new OTP has been sent.' }
    end

    # Rate limiting: block resend if OTP issued within last 60 seconds (Bug 25 fix)
    if user.otp_expires_at.present? && user.otp_expires_at > 14.minutes.from_now
      return render json: { success: false, message: 'Please wait before requesting another OTP.' }, status: :too_many_requests
    end

    otp = rand(100_000..999_999).to_s
    user.update_columns(otp_code: otp, otp_expires_at: 15.minutes.from_now)

    if params[:mode] == 'forgot-password'
      UserMailer.forgot_password(user, otp).deliver_later rescue nil
    else
      UserMailer.email_verification(user, otp).deliver_later rescue nil
    end

    render json: { success: true, message: 'If that email exists, a new OTP has been sent.' }
  end

  private

  def user_params
    params.require(:auth).permit(:name, :email, :phone, :password)
  rescue ActionController::ParameterMissing
    # Fallback if the frontend sends flat params instead of wrapped in `auth`
    params.permit(:name, :email, :phone, :password)
  end

  def generate_token(user_id)
    payload = { user_id: user_id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, Rails.application.secret_key_base)
  end
end
