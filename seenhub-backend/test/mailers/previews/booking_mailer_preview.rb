# Preview all emails at http://localhost:3000/rails/mailers/booking_mailer
class BookingMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/booking_mailer/booking_confirmation
  def booking_confirmation
    BookingMailer.booking_confirmation
  end

  # Preview this email at http://localhost:3000/rails/mailers/booking_mailer/admin_notification
  def admin_notification
    BookingMailer.admin_notification
  end
end
