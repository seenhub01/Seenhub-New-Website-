class UserMailer < ApplicationMailer
  def forgot_password(user, otp)
    @user = user
    @otp = otp
    mail to: @user.email, subject: "Reset Password OTP - SeenHub"
  end

  def email_verification(user, otp)
    @user = user
    @otp = otp
    mail to: @user.email, subject: "Email Verification OTP - SeenHub"
  end
end
