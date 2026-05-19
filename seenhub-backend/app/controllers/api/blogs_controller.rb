class Api::BlogsController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]
  def index
    render json: formatted_blogs(Blog.all)
  end

  def create_or_update
    blog = params[:id].present? ? Blog.find_by(id: params[:id]) : Blog.new
    if blog
      if blog.update(blog_params)
        render json: formatted_blogs(Blog.all)
      else
        render json: { success: false, message: blog.errors.full_messages.join(', ') }, status: :unprocessable_entity
      end
    else
      render json: { success: false, message: 'Blog not found' }, status: :not_found
    end
  end

  def destroy
    blog = Blog.find_by(id: params[:id])
    blog&.destroy
    render json: { success: true }
  end

  private

  def blog_params
    params.permit(:title, :subtitle, :author, :image, :content, :date)
  end

  def formatted_blogs(blogs)
    blogs.map do |b|
      {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        author: b.author,
        image: b.image,
        content: b.content,
        date: b.date
      }
    end
  end
end
