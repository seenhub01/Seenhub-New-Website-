class Api::SettingsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index]
  before_action :authenticate_admin!, only: [:create_or_update]
  def index
    setting = Setting.first || Setting.new
    render json: formatted_setting(setting)
  end

  def create_or_update
    setting = Setting.first || Setting.new
    if setting.update(setting_params)
      render json: formatted_setting(setting)
    else
      render json: { success: false, message: setting.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def setting_params
    params.permit(
      :qrPrefix, :qrTotalLength, :taxEnabled, :taxPercentage,
      :printCreditToPageRatio, :printMinTopUp, :printAedToCreditRatio,
      :currency, :printerIp, :logo, :contactWhatsApp, :contactPhone,
      :contactEmail, :websiteUrl, :membershipPrefix, :eventPrefix,
      openingHours: [:days, :time],
      socialLinks: [:platform, :url, :icon],
      workspacePrefixes: {},
      unitPrefixes: {}
    ).transform_keys(&:underscore)
  end

  def formatted_setting(setting)
    setting.as_json(except: [:id, :created_at, :updated_at]).transform_keys do |key|
      key.camelize(:lower)
    end
  end
end
