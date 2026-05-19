class AddFieldsToAnalytics < ActiveRecord::Migration[8.1]
  def change
    add_column :analytics, :device, :string
    add_column :analytics, :analytic_type, :string
  end
end
