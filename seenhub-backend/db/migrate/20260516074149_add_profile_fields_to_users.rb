class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :dob, :date
    add_column :users, :employment_status, :string
  end
end
