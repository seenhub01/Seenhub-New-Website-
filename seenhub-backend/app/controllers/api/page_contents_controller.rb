class Api::PageContentsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:show]
  def show
    content = PageContent.find_by(name: params[:name])
    if content
      render json: content.content
    else
      render json: {}, status: :not_found
    end
  end

  def create_or_update
    content = PageContent.find_or_initialize_by(name: params[:name])
    content.content = params[:content]
    content.save!
    render json: content.content
  end
end
