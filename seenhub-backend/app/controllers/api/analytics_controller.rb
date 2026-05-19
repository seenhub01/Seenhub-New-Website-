class Api::AnalyticsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create]
  before_action :authenticate_admin!, only: [:index]
  def index
    logs = Analytic.all
    now = Time.now.to_i * 1000
    five_mins_ago = 5.minutes.ago
    
    live_users = logs.where('created_at > ?', five_mins_ago).distinct.count(:session_id)
    total_visits = logs.where(analytic_type: 'visit').count
    
    page_views = logs.group(:path).count
    devices = logs.group(:device).count
    
    render json: {
      liveUsers: live_users,
      totalVisits: total_visits,
      pageViews: page_views,
      devices: devices,
      recentLogs: formatted_analytics(logs.order(timestamp: :desc).limit(100))
    }
  end

  def create
    Analytic.create(analytic_params.merge(
      ip: request.remote_ip,
      device: request.user_agent&.include?('Mobi') ? 'Mobile' : 'Desktop',
      timestamp: (Time.now.to_i * 1000).to_s
    ))
    render json: { success: true }
  end

  private

  def analytic_params
    params.permit(:path, :sessionId, :referrer, :location, :type).transform_keys(&:underscore).tap do |p|
      p[:analytic_type] = p.delete(:type) if p.key?(:type)
    end
  end

  def formatted_analytics(analytics)
    analytics.map do |a|
      a.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
    end
  end
end
