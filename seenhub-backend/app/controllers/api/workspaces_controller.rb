class Api::WorkspacesController < ApplicationController
  before_action :authenticate_admin!, except: [:index]
  skip_before_action :authenticate_user!, only: [:index]

  def index
    workspaces = Workspace.all
    if request.path.start_with?('/api/admin')
      render json: { success: true, data: formatted_workspaces(workspaces) }
    else
      render json: formatted_workspaces(workspaces)
    end
  end

  def create_or_update
    workspace = if params[:id].present?
                  Workspace.find_by(id: params[:id])
                else
                  Workspace.find_or_initialize_by(title: workspace_params[:title])
                end
    
    if workspace
      workspace.assign_attributes(workspace_params.except(:featured_image, :gallery_images))
      
      # Handle ActiveStorage attachments
      if params[:featured_image].present? && !params[:featured_image].is_a?(String)
        workspace.featured_image.attach(params[:featured_image])
      end
      
      if params[:gallery_images].present?
        Array(params[:gallery_images]).each do |img|
          workspace.gallery_images.attach(img) unless img.is_a?(String)
        end
      end

      if params[:purge_gallery_ids].present?
        Array(params[:purge_gallery_ids]).each do |attachment_id|
          workspace.gallery_images.find_by(id: attachment_id)&.purge
        end
      end

      if workspace.save
        render json: { success: true, data: formatted_workspaces(Workspace.all) }
      else
        render json: { success: false, message: workspace.errors.full_messages.join(', ') }, status: :unprocessable_entity
      end
    else
      render json: { success: false, message: 'Workspace not found' }, status: :not_found
    end
  end

  private

  def workspace_params
    wp = params[:workspace_category].present? ? params.require(:workspace_category) : params
    
    # Recursively convert all camelCase keys to snake_case
    wp_snaked = wp.to_unsafe_h.deep_transform_keys(&:underscore)
    
    # Wrap it back into ActionController::Parameters and permit
    ActionController::Parameters.new(wp_snaked).permit(
      :title, :subtitle, :description, :featured_img, :link, :max_guests, :units, :qr_prefix,
      :prefix,
      :featured_image, gallery_images: [],
      gallery: [],
      unit_names: [],
      unit_qr_prefixes: [],
      booking_types: [],
      pricing: [:hourly => [:individual, :corporate], :daily => [:individual, :corporate], :weekly => [:individual, :corporate], :monthly => [:individual, :corporate]],
      extra_guest_price: [:individual, :corporate],
      working_hours: {}
    )
  end

  def formatted_workspaces(workspaces)
    workspaces.map do |w|
      data = w.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
      
      # Add ActiveStorage URLs
      if w.featured_image.attached?
        data['featuredImg'] = url_for(w.featured_image)
      end
      
      if w.gallery_images.attached?
        data['gallery'] = w.gallery_images.map { |img| url_for(img) }
      end
      
      data
    end
  end
end
