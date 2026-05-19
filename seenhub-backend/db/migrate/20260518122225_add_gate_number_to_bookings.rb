class AddGateNumberToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :gate_number, :string
  end
end
