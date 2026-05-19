class CreateLockers < ActiveRecord::Migration[8.1]
  def change
    create_table :lockers do |t|
      t.string :code
      t.string :name
      t.string :status
      t.decimal :price

      t.timestamps
    end
  end
end
