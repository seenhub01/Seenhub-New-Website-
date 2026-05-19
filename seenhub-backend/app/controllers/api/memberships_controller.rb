class Api::MembershipsController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]
  def index
    render json: formatted_memberships(Membership.all)
  end

  def create_or_update
    if params[:id].present? && Membership.exists?(params[:id])
      membership = Membership.find(params[:id])
      membership.update(membership_params)
    else
      Membership.create(membership_params)
    end
    render json: formatted_memberships(Membership.all)
  end

  def destroy
    membership = Membership.find_by(id: params[:id])
    membership&.destroy
    render json: { success: true }
  end

  private

  def membership_params
    params.permit(
      :title, :subtitle, :price, :icon, :desc, :slug, :descThin,
      images: [],
      features: []
    ).transform_keys(&:underscore)
  end

  def formatted_memberships(memberships)
    memberships.map do |m|
      m.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    end
  end
end
