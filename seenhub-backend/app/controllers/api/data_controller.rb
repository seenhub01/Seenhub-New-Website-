class Api::DataController < ApplicationController
  before_action :authenticate_admin!
  
  def index
    type = params[:type]
    case type
    when 'users'
      render json: format_collection(User.all)
    when 'events'
      render json: format_collection(Event.all)
    when 'coupons'
      render json: format_collection(Coupon.all)
    when 'cafe_products'
      render json: format_collection(CafeProduct.all)
    when 'cafe_categories'
      render json: format_collection(CafeCategory.all)
    when 'cafe_invoices'
      render json: format_collection(CafeInvoice.all)
    when 'messages'
      render json: format_collection(Message.all)
    when 'lockers'
      render json: format_collection(Locker.all)
    when 'memberships'
      render json: format_collection(Membership.all)
    when 'analytics'
      render json: format_collection(Analytic.all)
    when 'stats'
      render json: { 
        bookings: Booking.count, 
        users: User.count,
        revenue: Booking.sum(:total) 
      }
    else
      render json: []
    end
  end

  def create
    render json: { success: true }
  end

  private

  def format_collection(collection)
    collection.as_json(except: [:created_at, :updated_at]).map do |item|
      item.transform_keys { |k| k.camelize(:lower) }
    end
  end
end
