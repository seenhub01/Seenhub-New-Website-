class CreateCafeProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :cafe_products do |t|
      t.string :name
      t.string :category
      t.decimal :price
      t.text :image
      t.text :description
      t.string :status

      t.timestamps
    end
  end
end
