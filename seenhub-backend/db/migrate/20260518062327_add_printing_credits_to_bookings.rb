class AddPrintingCreditsToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :printing_credits, :decimal
  end
end
