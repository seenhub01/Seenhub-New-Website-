class Api::Admin::AdminUsersController < ApplicationController
  before_action :authenticate_admin!
  def index
    render json: { success: true, data: format_admins(AdminUser.all) }
  end

  def create
    admin = AdminUser.new(admin_params)
    if admin.save
      render json: { success: true, data: format_admin(admin) }
    else
      render json: { success: false, message: admin.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    admin = AdminUser.find(params[:id])
    if admin.update(admin_params)
      render json: { success: true, data: format_admin(admin) }
    else
      render json: { success: false, message: admin.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    admin = AdminUser.find(params[:id])
    admin.destroy
    render json: { success: true }
  end

  private

  def admin_params
    params.require(:admin_user).permit(:name, :email, :password, :password_confirmation, :role, permissions: [])
  end

  def format_admin(admin)
    admin.as_json(except: [:password_digest, :created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
  end

  def format_admins(admins)
    admins.map { |a| format_admin(a) }
  end
end
