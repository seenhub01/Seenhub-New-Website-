class BookingMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.booking_mailer.booking_confirmation.subject
  #
  def booking_confirmation(booking)
    @booking = booking
    
    # Generate QR Code using the SAME code shown in dashboard
    qr_data = @booking.qr_code.present? ? @booking.qr_code : @booking.booking_id
    qr = RQRCode::QRCode.new(qr_data)
    png = qr.as_png(
      bit_depth: 1,
      border_modules: 4,
      color_mode: ChunkyPNG::COLOR_GRAYSCALE,
      color: 'black',
      file: nil,
      fill: 'white',
      module_px_size: 6,
      resize_exactly_to: false,
      resize_gte_to: false,
      size: 240
    )
    
    attachments.inline['qrcode.png'] = png.to_s
    
    mail to: @booking.email, subject: "Booking Confirmation - SeenHub (#{@booking.id})"
  end

  def admin_notification(booking)
    @booking = booking
    mail to: "info@seenhub.ae", subject: "New Booking Alert - SeenHub (#{@booking.id})"
  end
end
