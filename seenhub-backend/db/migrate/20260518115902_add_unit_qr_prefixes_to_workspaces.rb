class AddUnitQrPrefixesToWorkspaces < ActiveRecord::Migration[8.1]
  def change
    add_column :workspaces, :unit_qr_prefixes, :json
  end
end
