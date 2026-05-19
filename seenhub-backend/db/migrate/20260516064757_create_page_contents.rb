class CreatePageContents < ActiveRecord::Migration[8.1]
  def change
    create_table :page_contents do |t|
      t.string :name
      t.json :content

      t.timestamps
    end
  end
end
