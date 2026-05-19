class CreateRefunds < ActiveRecord::Migration[8.1]
  def change
    create_table :refunds do |t|
      t.string :refund_id
      t.string :booking_id
      t.decimal :amount
      t.string :currency
      t.string :timestamp
      t.string :customer

      t.timestamps
    end
  end
end
