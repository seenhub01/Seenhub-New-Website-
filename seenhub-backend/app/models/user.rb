class User < ApplicationRecord
  has_secure_password

  has_many :bookings, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, allow_nil: true
  validates :phone, presence: true, uniqueness: true
end
