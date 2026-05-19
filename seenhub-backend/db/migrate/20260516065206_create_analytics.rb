class CreateAnalytics < ActiveRecord::Migration[8.1]
  def change
    create_table :analytics do |t|
      t.string :path
      t.string :session_id
      t.string :referrer
      t.string :ip
      t.string :location
      t.string :timestamp

      t.timestamps
    end
  end
end
