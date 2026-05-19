class CreateSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :settings do |t|
      t.string :qr_prefix
      t.integer :qr_total_length
      t.boolean :tax_enabled
      t.decimal :tax_percentage
      t.decimal :print_credit_to_page_ratio
      t.decimal :print_min_top_up
      t.decimal :print_aed_to_credit_ratio
      t.string :currency
      t.string :printer_ip
      t.text :logo
      t.string :contact_whats_app
      t.string :contact_phone
      t.string :contact_email
      t.json :opening_hours
      t.json :social_links
      t.string :website_url
      t.json :workspace_prefixes
      t.json :unit_prefixes
      t.string :membership_prefix
      t.string :event_prefix

      t.timestamps
    end
  end
end
