class CreateWorkspaces < ActiveRecord::Migration[8.1]
  def change
    create_table :workspaces do |t|
      t.string :title
      t.string :subtitle
      t.text :description
      t.string :featured_img
      t.json :gallery
      t.string :link
      t.integer :max_guests
      t.integer :units
      t.json :unit_names
      t.json :booking_types
      t.json :pricing
      t.json :extra_guest_price
      t.json :working_hours
      t.string :qr_prefix

      t.timestamps
    end
  end
end
