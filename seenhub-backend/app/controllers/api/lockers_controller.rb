class Api::LockersController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]
  def index
    render json: formatted_lockers
  end

  def create_or_update
    if params[:id].present?
      locker = Locker.find_by(id: params[:id])
      locker&.update(locker_params)
    else
      Locker.create(locker_params)
    end
    
    render json: formatted_lockers
  end

  def destroy
    locker = Locker.find_by(id: params[:id])
    locker&.destroy
    render json: { success: true }
  end

  private

  def locker_params
    params.permit(:code, :name, :status, :price)
  end

  def formatted_lockers
    Locker.all.map do |l|
      {
        id: l.id,
        code: l.code,
        name: l.name,
        status: l.status,
        price: l.price,
        createdAt: l.created_at ? l.created_at.strftime("%b %d, %Y at %I:%M %p") : nil,
        updatedAt: l.updated_at
      }
    end
  end
end
