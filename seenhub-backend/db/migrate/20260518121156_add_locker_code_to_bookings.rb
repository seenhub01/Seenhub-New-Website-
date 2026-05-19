class AddLockerCodeToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :locker_code, :string
  end
end
