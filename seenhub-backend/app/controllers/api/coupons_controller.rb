class Api::CouponsController < ApplicationController
  before_action :authenticate_admin!, except: [:index, :validate]
  skip_before_action :authenticate_user!, only: [:index, :validate]

  def index
    render json: formatted_coupons(Coupon.all)
  end

  # POST /api/coupons/validate
  # Body: { code: "SAVE10", category: "workspaces" }
  def validate
    code     = params[:code].to_s.strip.upcase
    category = params[:category].to_s.strip

    coupon = Coupon.find_by(code: code)

    if coupon.nil?
      return render json: { success: false, error: 'Coupon not found.' }, status: :not_found
    end

    # Category can be blank (applies to all) or must match
    if coupon.category.present? && coupon.category.downcase != category.downcase
      return render json: { success: false, error: "This coupon is not valid for #{category}." }, status: :unprocessable_entity
    end

    render json: {
      success:  true,
      code:     coupon.code,
      discount: coupon.discount.to_f,
      category: coupon.category
    }
  end

  def create_or_update
    normalized_params = coupon_params
    if normalized_params[:code].present?
      normalized_params[:code] = normalized_params[:code].to_s.strip.upcase
    end

    if params[:id].present?
      coupon = Coupon.find_by(id: params[:id])
      coupon&.update(normalized_params)
    else
      Coupon.create(normalized_params)
    end
    render json: formatted_coupons(Coupon.all)
  end

  def destroy
    coupon = Coupon.find_by(id: params[:id])
    coupon&.destroy
    render json: { success: true }
  end

  private

  def coupon_params
    params.permit(:code, :discount, :category)
  end

  def formatted_coupons(coupons)
    coupons.map do |c|
      {
        id:       c.id,
        code:     c.code,
        discount: c.discount,
        category: c.category
      }
    end
  end
end
