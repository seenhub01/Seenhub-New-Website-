class Api::EventsController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]
  def index
    render json: formatted_events(Event.all)
  end

  def create_or_update
    if params[:id].present? && Event.exists?(params[:id])
      event = Event.find(params[:id])
      event.update(event_params)
    else
      Event.create(event_params)
    end
    render json: formatted_events(Event.all)
  end

  def destroy
    id = params[:id]
    event = Event.find_by(id: id)
    event&.destroy
    render json: { success: true }
  end

  private

  def event_params
    params.permit(
      :title, :location, :startDate, :endDate, :startTime, :endTime, 
      :gateNumber, :eventType, :description, :status, :totalTickets, :price
    ).transform_keys(&:underscore)
  end

  def formatted_events(events)
    events.map do |e|
      e.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    end
  end
end
