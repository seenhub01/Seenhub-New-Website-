class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.string :booking_id
      t.string :name
      t.string :email
      t.string :phone
      t.string :booking_type
      t.date :date
      t.string :time_from
      t.string :time_to
      t.integer :guests
      t.string :space
      t.text :notes
      t.json :addons
      t.integer :printing_bundles
      t.string :category
      t.date :calculated_end_date
      t.decimal :subtotal
      t.decimal :tax
      t.decimal :total
      t.decimal :discount
      t.string :duration_label
      t.decimal :space_subtotal
      t.string :assigned_unit
      t.string :status
      t.string :qr_code
      t.string :coupon_code
      t.decimal :discount_percent
      t.string :applied_coupon
      t.integer :total_units
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end
    add_index :bookings, :booking_id
  end
end
