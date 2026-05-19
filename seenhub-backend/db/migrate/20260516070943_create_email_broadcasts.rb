class CreateEmailBroadcasts < ActiveRecord::Migration[8.1]
  def change
    create_table :email_broadcasts do |t|
      t.string :subject
      t.text :content
      t.integer :recipient_count
      t.string :status
      t.datetime :timestamp

      t.timestamps
    end
  end
end
