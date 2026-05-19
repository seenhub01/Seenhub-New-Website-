class CreateCoupons < ActiveRecord::Migration[8.1]
  def change
    create_table :coupons do |t|
      t.string :code
      t.decimal :discount
      t.string :category

      t.timestamps
    end
  end
end
