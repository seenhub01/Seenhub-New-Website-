class CreateBlogs < ActiveRecord::Migration[8.1]
  def change
    create_table :blogs do |t|
      t.string :title
      t.string :subtitle
      t.string :author
      t.text :image
      t.text :content
      t.date :date

      t.timestamps
    end
  end
end
