class Locker < ApplicationRecord
  validates :code, presence: true, uniqueness: { case_sensitive: false }
  validates :status, presence: true, inclusion: { in: %w[AVAILABLE OCCUPIED MAINTENANCE] }
  validates :price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
