require "test_helper"

class BookingMailerTest < ActionMailer::TestCase
  test "booking_confirmation" do
    mail = BookingMailer.booking_confirmation
    assert_equal "Booking confirmation", mail.subject
    assert_equal [ "to@example.org" ], mail.to
    assert_equal [ "from@example.com" ], mail.from
    assert_match "Hi", mail.body.encoded
  end

  test "admin_notification" do
    mail = BookingMailer.admin_notification
    assert_equal "Admin notification", mail.subject
    assert_equal [ "to@example.org" ], mail.to
    assert_equal [ "from@example.com" ], mail.from
    assert_match "Hi", mail.body.encoded
  end
end
