class Api::CafeProductsController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]

  def index
    render json: formatted_products(CafeProduct.all)
  end

  def create_or_update
    if params[:id].present? && CafeProduct.exists?(params[:id])
      product = CafeProduct.find(params[:id])
      product.update(product_params)
    else
      product = CafeProduct.create(product_params)
    end
    render json: formatted_products(CafeProduct.all)
  end

  def destroy
    id = params[:id]
    product = CafeProduct.find_by(id: id)
    product&.destroy
    render json: { success: true }
  end

  private

  def product_params
    params.permit(:name, :category, :price, :image, :description, :status)
  end

  def formatted_products(products)
    products.map do |p|
      {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        status: p.status || 'Available'
      }
    end
  end
end
