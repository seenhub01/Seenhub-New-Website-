class CreateCafeInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :cafe_invoices do |t|
      t.string :invoice_id
      t.string :customer_name
      t.string :customer_email
      t.string :product_name
      t.decimal :total
      t.string :date
      t.string :status

      t.timestamps
    end
  end
end
