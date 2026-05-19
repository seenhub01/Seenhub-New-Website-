class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.string :title
      t.string :location
      t.date :start_date
      t.date :end_date
      t.string :start_time
      t.string :end_time
      t.string :gate_number
      t.string :event_type
      t.text :description
      t.string :status
      t.integer :total_tickets
      t.decimal :price

      t.timestamps
    end
  end
end
