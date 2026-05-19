class CreateCafeCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :cafe_categories do |t|
      t.string :name

      t.timestamps
    end
  end
end
