class Api::RefundsController < ApplicationController
  before_action :authenticate_admin!
  skip_before_action :authenticate_user!
  def index
    render json: formatted_refunds(Refund.all)
  end

  def create
    refund = Refund.new(refund_params)
    if refund.save
      render json: formatted_refunds(Refund.all)
    else
      render json: { success: false, message: refund.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def refund_params
    params.permit(:bookingId, :amount, :currency, :timestamp, :customer).transform_keys(&:underscore)
  end

  def formatted_refunds(refunds)
    refunds.map do |r|
      r.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    end
  end
end
