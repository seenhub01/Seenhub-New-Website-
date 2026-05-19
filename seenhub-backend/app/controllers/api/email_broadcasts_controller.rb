class Api::EmailBroadcastsController < ApplicationController
  before_action :authenticate_admin!
  def index
    render json: formatted_broadcasts(EmailBroadcast.all)
  end

  def create
    broadcast = EmailBroadcast.create!(broadcast_params.merge(timestamp: Time.now, status: 'Queued'))
    render json: { success: true, broadcastId: broadcast.id }
  end

  private

  def broadcast_params
    p = params.permit(:subject, :html, :recipientCount).transform_keys(&:underscore)
    p[:content] = p.delete('html') if p.key?('html')
    p
  end

  def formatted_broadcasts(broadcasts)
    broadcasts.map do |b|
      {
        id: b.id,
        timestamp: b.timestamp,
        subject: b.subject,
        html: b.content,
        recipientCount: b.recipient_count,
        status: b.status
      }
    end
  end
end

