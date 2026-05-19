class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :query_type
      t.text :message
      t.string :date
      t.string :status

      t.timestamps
    end
  end
end
