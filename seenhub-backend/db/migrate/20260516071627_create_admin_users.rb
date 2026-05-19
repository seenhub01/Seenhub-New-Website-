class CreateAdminUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :admin_users do |t|
      t.string :name
      t.string :email
      t.string :password_digest
      t.string :role
      t.text :permissions

      t.timestamps
    end
  end
end
