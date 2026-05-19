class CreateMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :memberships do |t|
      t.string :title
      t.string :subtitle
      t.decimal :price
      t.string :icon
      t.text :desc
      t.string :slug
      t.json :images
      t.json :features
      t.text :desc_thin

      t.timestamps
    end
  end
end
