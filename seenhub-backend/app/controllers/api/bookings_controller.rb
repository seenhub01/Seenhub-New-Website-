class Api::BookingsController < ApplicationController
  before_action :authenticate_admin!, only: [:destroy]
  before_action :set_current_actor_from_token, only: [:index, :calculate_price, :create_or_update]
  skip_before_action :authenticate_user!, only: [:index, :show, :create_or_update, :calculate_price]
  skip_before_action :authenticate_admin!, only: [:index, :show, :create_or_update, :calculate_price]
  def index
    if params[:space].present? && params[:date].present?
      workspace = Workspace.find_by(title: params[:space])
      total_units = workspace&.units || 1

      requested_date = params[:date]
      requested_type = params[:booking_type] || 'Hourly'
      requested_from = params[:time_from]
      requested_to = params[:time_to]

      # Find all active bookings on that workspace overlapping the date
      active_bookings = Booking.where(space: params[:space])
                               .where.not(status: ['Cancelled', 'Expired'])
                               .where("date <= ? AND COALESCE(NULLIF(calculated_end_date, ''), date) >= ?", requested_date, requested_date)

      to_min = ->(t) {
        return 0 if t.blank?
        parts = t.split(':').map(&:to_i)
        parts[0] * 60 + (parts[1] || 0)
      }

      # Determine which active bookings conflict with the requested time/type
      conflict_bookings = active_bookings.select do |b|
        if requested_type != 'Hourly'
          true
        else
          if b.booking_type != 'Hourly'
            true
          else
            b_from = to_min.call(b.time_from)
            b_to = to_min.call(b.time_to)
            req_from = to_min.call(requested_from)
            req_to = to_min.call(requested_to)

            b_from < req_to && b_to > req_from
          end
        end
      end

      booked_count = conflict_bookings.count
      available_code = Locker.where(status: 'AVAILABLE').first&.code || "LK-#{rand(100..999)}"
      
      render json: {
        available: booked_count < total_units,
        unit: booked_count + 1,
        bookedCount: booked_count,
        totalUnits: total_units,
        availableLocker: available_code
      }
    elsif params[:space].present?
      bookings = Booking.where(space: params[:space])
                        .where.not(status: ['Cancelled', 'Expired'])
      render json: formatted_bookings(bookings)
    elsif params[:email].present?
      bookings = Booking.where(email: params[:email])
      render json: formatted_bookings(bookings)
    else
      if current_admin
        render json: formatted_bookings(Booking.all)
      else
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    end
  end

  def calculate_price
    setting = Setting.first || Setting.new
    settings = setting.as_json
    service = BookingPricingService.new(params, settings, @current_user)
    render json: service.calculate
  end

  def create_or_update
    booking = params[:id].present? ? Booking.find_by(booking_id: params[:id]) : nil

    # Capacity check (Resolves Bug 8)
    category = params[:category] || 'workspaces'
    if booking.nil? && category == 'workspaces' && params[:space].present? && params[:date].present?
      workspace = Workspace.find_by(title: params[:space])
      total_units = workspace&.units || 1

      requested_date = params[:date]
      requested_type = params[:booking_type] || 'Hourly'
      requested_from = params[:time_from]
      requested_to = params[:time_to]

      # Find all active bookings on that workspace overlapping the date
      active_bookings = Booking.where(space: params[:space])
                               .where.not(status: ['Cancelled', 'Expired'])
                               .where("date <= ? AND COALESCE(NULLIF(calculated_end_date, ''), date) >= ?", requested_date, requested_date)

      to_min = ->(t) {
        return 0 if t.blank?
        parts = t.split(':').map(&:to_i)
        parts[0] * 60 + (parts[1] || 0)
      }

      # Determine which active bookings conflict with the requested time/type
      conflict_bookings = active_bookings.select do |b|
        if requested_type != 'Hourly'
          true
        else
          if b.booking_type != 'Hourly'
            true
          else
            b_from = to_min.call(b.time_from)
            b_to = to_min.call(b.time_to)
            req_from = to_min.call(requested_from)
            req_to = to_min.call(requested_to)

            b_from < req_to && b_to > req_from
          end
        end
      end

      bookings_count = conflict_bookings.count
      if bookings_count >= total_units
        return render json: { success: false, message: 'This workspace is fully booked for the selected date.' }, status: :unprocessable_entity
      end
      
      occupied_units = conflict_bookings.map(&:assigned_unit).compact.map(&:to_i)
      available_unit = (1..total_units).find { |u| !occupied_units.include?(u) } || 1
      @auto_assigned_unit = available_unit.to_s
    end

    setting = Setting.first || Setting.new
    settings = setting.as_json
    pricing = BookingPricingService.new(params, settings, @current_user).calculate
    
    # Financial parameters security override (Resolves Bug 4)
    secured_params = booking_params.except(:subtotal, :tax, :total, :discount, :discount_percent)
    unless current_admin
      secured_params = secured_params.except(:status, :coupon_code, :applied_coupon)
    end

    begin
      if booking
        # Check authorization: user can only edit their own booking unless admin
        unless current_admin || (@current_user && booking.email == @current_user.email)
          return render json: { success: false, error: 'Unauthorized to modify this booking' }, status: :unauthorized
        end

        booking.update!(secured_params.merge(
          subtotal: pricing[:subtotal],
          tax: pricing[:tax],
          total: pricing[:total],
          discount: pricing[:discount] || 0
        ))
      else
        bid = params[:id] || "BK-#{Time.now.to_i}-#{SecureRandom.hex(2).upcase}"
        final_params = secured_params.merge(
          booking_id: bid,
          subtotal: pricing[:subtotal],
          tax: pricing[:tax],
          total: pricing[:total],
          discount: pricing[:discount] || 0
        )
        final_params[:assigned_unit] ||= @auto_assigned_unit if @auto_assigned_unit
        final_params[:status] ||= 'Confirmed'
        booking = Booking.create!(final_params)
      end
    rescue ActiveRecord::RecordInvalid => e
      return render json: { success: false, message: e.message }, status: :unprocessable_entity
    end
    
    if booking.persisted?
      # Lock associated locker if assigned (Resolves Bug 10)
      if booking.locker_code.present?
        if booking.status == 'Cancelled'
          Locker.find_by(code: booking.locker_code)&.update(status: 'AVAILABLE')
        else
          Locker.find_by(code: booking.locker_code)&.update(status: 'OCCUPIED')
        end
      end

      begin
        BookingMailer.booking_confirmation(booking).deliver_now
        BookingMailer.admin_notification(booking).deliver_now
      rescue => e
        Rails.logger.error "Email delivery failed for booking #{booking.id}: #{e.message}"
      end
    end
    
    render json: { success: true, booking: formatted_booking(booking) }
  end

  def show
    booking = Booking.find_by(booking_id: params[:id])
    if booking
      render json: {
        success: true,
        verified: true,
        booking: formatted_booking(booking)
      }
    else
      render json: { success: false, message: 'Invalid QR Code or Booking ID' }, status: :not_found
    end
  end

  def destroy
    booking = Booking.find_by(booking_id: params[:id])
    if booking
      # Release associated locker (Resolves Bug 10)
      if booking.locker_code.present?
        Locker.find_by(code: booking.locker_code)&.update(status: 'AVAILABLE')
      end
      booking.destroy
      render json: { success: true }
    else
      render json: { success: false, message: 'Booking not found' }, status: :not_found
    end
  end

  private

  def formatted_booking(b)
    format_booking_item(b)
  end

  def booking_params
    params.permit(
      :name, :email, :phone, :bookingType, :date, :timeFrom, :timeTo, :guests,
      :space, :notes, :printingBundles, :category, :calculatedEndDate,
      :subtotal, :tax, :total, :discount, :durationLabel, :spaceSubtotal,
      :assignedUnit, :status, :qrCode, :couponCode, :discountPercent,
      :appliedCoupon, :totalUnits, :printingCredits, :lockerCode, :gateNumber,
      addons: []
    ).transform_keys(&:underscore)
  end

  def formatted_bookings(bookings)
    bookings.map { |b| format_booking_item(b) }
  end

  def format_booking_item(b)
    data = b.as_json(except: [:id, :created_at, :updated_at])
    
    assigned_unit_name = nil
    if b.assigned_unit.present?
      if b.assigned_unit =~ /\A\d+\z/
        workspace = Workspace.find_by(title: b.space)
        if workspace && workspace.unit_names.is_a?(Array)
          idx = b.assigned_unit.to_i - 1
          assigned_unit_name = workspace.unit_names[idx] if idx >= 0 && workspace.unit_names[idx].present?
        end
        
        if assigned_unit_name.blank? && workspace
          qr_prefix = workspace.qr_prefix.presence || workspace.prefix.presence
          if qr_prefix.present?
            unit_num = b.assigned_unit.to_i
            if qr_prefix =~ /\A(.*?)(0*\d+)\z/
              prefix_base = $1
              num_str = $2
              val = num_str.to_i + unit_num - 1
              formatted_num = sprintf("%0#{num_str.length}d", val)
              assigned_unit_name = "#{b.space} #{prefix_base}#{formatted_num}"
            else
              if unit_num > 1
                assigned_unit_name = "#{b.space} #{qr_prefix}-#{unit_num}"
              else
                assigned_unit_name = "#{b.space} #{qr_prefix}"
              end
            end
          end
        end
        
        assigned_unit_name ||= "#{b.space} Unit #{b.assigned_unit}"
      else
        assigned_unit_name = b.assigned_unit
      end
    end
    
    data.merge({
      "id" => b.booking_id,
      "createdAt" => b.created_at,
      "assignedUnitName" => assigned_unit_name
    }).transform_keys { |k| k.camelize(:lower) }
  end
end
