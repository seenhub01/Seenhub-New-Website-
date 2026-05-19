class Api::Admin::AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:login]

  def login
    admin = AdminUser.find_by(email: params[:email])
    if admin&.authenticate(params[:password])
      token = generate_admin_token(admin.id)
      render json: {
        success: true,
        token: token,
        admin: format_admin(admin)
      }
    else
      render json: { success: false, message: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def me
    token = request.headers['Authorization']&.split(' ')&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secret_key_base).first
        admin = AdminUser.find(decoded['admin_id'])
        render json: { success: true, admin: format_admin(admin) }
      rescue
        render json: { success: false }, status: :unauthorized
      end
    else
      render json: { success: false }, status: :unauthorized
    end
  end

  private

  def generate_admin_token(admin_id)
    payload = { admin_id: admin_id, exp: 12.hours.from_now.to_i }
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  def format_admin(admin)
    admin.as_json(except: [:password_digest, :created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
  end
end
