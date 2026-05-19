class Api::MessagesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create_or_update]
  before_action :authenticate_admin!, except: [:create_or_update]
  def index
    render json: formatted_messages(Message.all)
  end

  def create_or_update
    if params[:id].present? && Message.exists?(params[:id])
      message = Message.find(params[:id])
      message.update(message_params)
    else
      Message.create(message_params)
    end
    render json: formatted_messages(Message.all)
  end

  def destroy
    message = Message.find_by(id: params[:id])
    message&.destroy
    render json: { success: true }
  end

  private

  def message_params
    params.permit(:firstName, :lastName, :email, :queryType, :message, :date, :status).transform_keys(&:underscore)
  end

  def formatted_messages(messages)
    messages.map do |m|
      m.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    end
  end
end
