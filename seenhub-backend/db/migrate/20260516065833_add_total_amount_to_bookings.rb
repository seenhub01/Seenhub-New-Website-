class AddTotalAmountToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :total_amount, :decimal
  end
end
