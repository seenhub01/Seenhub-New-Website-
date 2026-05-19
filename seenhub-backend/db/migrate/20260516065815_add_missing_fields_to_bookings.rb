class AddMissingFieldsToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :time, :string
    add_column :bookings, :service, :string
  end
end
