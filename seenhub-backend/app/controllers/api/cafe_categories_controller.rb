class Api::CafeCategoriesController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]
  def index
    render json: formatted_categories(CafeCategory.all)
  end

  def create_or_update
    if params[:id].present? && CafeCategory.exists?(params[:id])
      category = CafeCategory.find(params[:id])
      category.update(category_params)
    else
      CafeCategory.create(category_params)
    end
    render json: formatted_categories(CafeCategory.all)
  end

  def destroy
    category = CafeCategory.find_by(id: params[:id])
    category&.destroy
    render json: { success: true }
  end

  private

  def category_params
    params.permit(:name)
  end

  def formatted_categories(categories)
    categories.map do |c|
      c.as_json(except: [:created_at, :updated_at])
    end
  end
end
