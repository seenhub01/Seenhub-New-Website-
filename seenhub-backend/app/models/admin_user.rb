class AdminUser < ApplicationRecord
  has_secure_password
  serialize :permissions, type: Array, coder: JSON
end
