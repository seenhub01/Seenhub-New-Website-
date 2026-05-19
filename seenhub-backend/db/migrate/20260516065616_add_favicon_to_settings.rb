class AddFaviconToSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :settings, :favicon, :text
  end
end
