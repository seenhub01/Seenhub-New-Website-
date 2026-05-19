class AddIndexesToModels < ActiveRecord::Migration[8.1]
  def change
    add_index :users, :email, unique: true
    add_index :admin_users, :email, unique: true
    add_index :bookings, :booking_id, unique: true
    add_index :bookings, :email
    add_index :workspaces, :link
    add_index :memberships, :slug
  end
end
