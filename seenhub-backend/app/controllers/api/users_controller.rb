class Api::UsersController < ApplicationController
  before_action :authenticate_admin!, except: [:create, :update]
  skip_before_action :authenticate_user!, only: [:create]
  def index
    render json: format_collection(User.all)
  end

  def create
    # Combine names from frontend safely (failsafe fallback for Bug 18)
    user_data = params[:user] || {}
    first = user_data[:first_name] || params[:first_name]
    middle = user_data[:middle_name] || params[:middle_name]
    last = user_data[:last_name] || params[:last_name]
    full_name = [first, middle, last].compact.join(' ').squeeze(' ')
    
    user_params_mapped = {
      name: full_name.blank? ? (params[:name] || 'New User') : full_name,
      email: user_data[:email] || params[:email],
      password: user_data[:password] || params[:password],
      phone: user_data[:phone_number] || params[:phone_number] || params[:phone],
      dob: user_data[:dob] || params[:dob],
      employment_status: user_data[:employment_status] || params[:employment_status] || 'Individual'
    }

    user = User.new(user_params_mapped)
    if user.save
      otp = rand(100_000..999_999).to_s
      user.update_columns(otp_code: otp, otp_expires_at: 15.minutes.from_now)
      UserMailer.email_verification(user, otp).deliver_later rescue nil
      render json: { success: true, pending_verification: true, user: format_item(user) }
    else
      render json: { success: false, message: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    user = User.find_by(email: params[:email]) || User.find_by(id: params[:id])
    if user
      # Self or admin check (resolves Bug 16)
      is_self = @current_user && @current_user.id == user.id
      if is_self || current_admin
        if user.update(user_params)
          render json: { success: true, user: format_item(user) }
        else
          render json: { success: false, message: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Unauthorized profile update' }, status: :unauthorized
      end
    else
      render json: { success: false, message: 'User not found' }, status: :not_found
    end
  end

  def destroy
    user = User.find_by(id: params[:id])
    if user
      user.destroy
      render json: { success: true }
    else
      render json: { success: false, message: 'User not found' }, status: :not_found
    end
  end

  private

  def user_params
    params.permit(:name, :email, :phone, :password, :printingCredits, :employmentStatus).transform_keys(&:underscore)
  end

  def format_item(item)
    data = item.as_json(except: [:password_digest, :created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    is_corp = (item.employment_status.to_s.downcase == 'corporate' || item.employment_status.to_s.downcase == 'employed')
    data['role'] = is_corp ? 'Corporate' : 'Individual'
    data['isCorporate'] = is_corp
    data
  end

  def format_collection(collection)
    collection.map { |i| format_item(i) }
  end
end
