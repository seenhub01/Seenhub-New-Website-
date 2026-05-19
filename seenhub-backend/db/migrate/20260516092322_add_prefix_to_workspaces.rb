class AddPrefixToWorkspaces < ActiveRecord::Migration[8.1]
  def change
    add_column :workspaces, :prefix, :string
  end
end
