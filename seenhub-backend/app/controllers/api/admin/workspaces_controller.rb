class Api::Admin::WorkspacesController < Api::WorkspacesController
  before_action :authenticate_admin!
end
