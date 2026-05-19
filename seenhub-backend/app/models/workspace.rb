class Workspace < ApplicationRecord
  has_one_attached :featured_image
  has_many_attached :gallery_images
  validates :title, presence: true, uniqueness: { case_sensitive: false }
end
