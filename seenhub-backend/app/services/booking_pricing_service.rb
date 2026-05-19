class BookingPricingService
  def initialize(params, settings, user = nil)
    @params = params
    @settings = settings
    @user = user
  end

  def calculate
    category = @params[:category]
    space_title = @params[:space]
    booking_type = @params[:bookingType] || 'Hourly'
    guests = (@params[:guests] || 1).to_i
    time_from = @params[:timeFrom]
    time_to = @params[:timeTo]
    
    base_price = 0
    
    case category
    when 'workspaces'
      workspace = Workspace.find_by(title: space_title)
      return { error: 'Workspace not found' } unless workspace
      
      pricing = workspace.pricing || {}
      type_key = booking_type.downcase
      
      # Determine user role (Individual vs Corporate)
      is_corporate = @user.present? && (@user.employment_status.to_s.downcase == 'corporate' || @user.employment_status.to_s.downcase == 'employed')
      price_type = is_corporate ? 'corporate' : 'individual'
      
      # Get price for the type with fallback to individual if corporate is unset or 0
      price_config = pricing[type_key] || pricing['daily'] || { 'individual' => 100 }
      unit_price = (price_config[price_type] || price_config['individual'] || 100).to_f
      unit_price = (price_config['individual'] || 100).to_f if unit_price <= 0
      
      # Base Workspace Price (Flat Room/Space Subtotal)
      if type_key == 'hourly' && time_from.present? && time_to.present?
        hours = calculate_hours(time_from, time_to)
        space_subtotal = unit_price * hours
      else
        space_subtotal = unit_price
      end
      
      # Extra Guest Charge (per additional guest beyond 1)
      extra_guest_config = workspace.extra_guest_price || {}
      extra_guest_price = (extra_guest_config[price_type] || extra_guest_config['individual'] || 0).to_f
      extra_guests = [0, guests - 1].max
      
      base_price = space_subtotal + (extra_guests * extra_guest_price)
      
    when 'memberships'
      membership = Membership.find_by(title: space_title) || Membership.find_by(slug: space_title)
      base_price = (membership&.price || 100).to_f
      
    when 'events'
      event = Event.find_by(title: space_title)
      base_price = (event&.price || 0).to_f * guests
      
    when 'printing'
      base_price = guests # Printing is often 1 AED per credit/guest in current logic
    end

    # Add addons
    addons_cost = 0
    addons_cost += 10 if @params[:lockerCode].present?
    
    if @params[:printingBundles].to_i > 0
      ratio = @settings['print_aed_to_credit_ratio'] || 0.2
      addons_cost += (@params[:printingBundles].to_i * (1.0 / ratio))
    end

    subtotal = base_price + addons_cost
    
    # Bug 9 Fix: Apply coupon discounts
    discount = 0
    if @params[:couponCode].present? || @params[:appliedCoupon].present?
      code = (@params[:couponCode] || @params[:appliedCoupon]).to_s.upcase
      coupon = Coupon.find_by(code: code)
      if coupon && (coupon.category.blank? || coupon.category.downcase == category.to_s.downcase)
        discount = coupon.discount.to_f
        subtotal -= discount
        subtotal = 0 if subtotal < 0
      end
    end

    tax_rate = @settings['tax_enabled'] ? (@settings['tax_percentage'] || 5).to_f / 100.0 : 0
    tax = (subtotal * tax_rate).round(2)
    total = (subtotal + tax).round(2)

    {
      subtotal: subtotal,
      tax: tax,
      total: total,
      base_price: base_price,
      addons_cost: addons_cost
    }
  end

  private

  def calculate_hours(from, to)
    fh, fm = from.split(':').map(&:to_i)
    th, tm = to.split(':').map(&:to_i)
    
    start_val = fh + (fm / 60.0)
    end_val = th + (tm / 60.0)
    
    [1.0, end_val - start_val].max
  end
end
