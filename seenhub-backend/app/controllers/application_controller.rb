class ApplicationController < ActionController::API
  before_action :set_active_storage_host
  before_action :authenticate_user!
  
  attr_reader :current_user, :current_admin

  private

  def set_active_storage_host
    ActiveStorage::Current.url_options = { host: request.base_url }
  end

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secret_key_base, true, { verify_expiration: true }).first
        if decoded['user_id']
          @current_user = User.find(decoded['user_id'])
        elsif decoded['admin_id']
          @current_admin = AdminUser.find(decoded['admin_id'])
        end
        
        # If neither is found, return unauthorized
        unless @current_user || @current_admin
          render json: { success: false, message: 'Invalid token payload' }, status: :unauthorized
        end
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { success: false, message: 'Invalid token' }, status: :unauthorized
      end
    else
      render json: { success: false, message: 'Token missing' }, status: :unauthorized
    end
  end

  def authenticate_admin!
    authenticate_user! unless @current_admin
    return if performed?
    unless @current_admin
      render json: { success: false, message: 'Admin access required' }, status: :forbidden
    end
  end

  def set_current_actor_from_token
    token = request.headers['Authorization']&.split(' ')&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secret_key_base).first
        if decoded['user_id']
          @current_user = User.find_by(id: decoded['user_id'])
        elsif decoded['admin_id']
          @current_admin = AdminUser.find_by(id: decoded['admin_id'])
        end
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        # Do nothing, let them remain nil
      end
    end
  end
end
