class Booking < ApplicationRecord
  belongs_to :user, optional: true
  
  before_create :generate_qr_code

  private

  def generate_qr_code
    prefix = "BK"
    if self.space.present?
      workspace = Workspace.find_by(title: self.space)
      if workspace
        unit_prefix = nil
        if self.assigned_unit.present?
          if self.assigned_unit =~ /\A\d+\z/
            idx = self.assigned_unit.to_i - 1
            if idx >= 0 && workspace.unit_qr_prefixes.is_a?(Array) && workspace.unit_qr_prefixes[idx].present?
              unit_prefix = workspace.unit_qr_prefixes[idx]
            end
          else
            if workspace.unit_names.is_a?(Array)
              u_idx = workspace.unit_names.index { |n| n.to_s.downcase == self.assigned_unit.to_s.downcase }
              if u_idx && workspace.unit_qr_prefixes.is_a?(Array) && workspace.unit_qr_prefixes[u_idx].present?
                unit_prefix = workspace.unit_qr_prefixes[u_idx]
              end
            end
          end
        end

        if unit_prefix.blank?
          base_prefix = workspace.qr_prefix.presence || workspace.prefix.presence
          if base_prefix.present?
            if self.assigned_unit.present?
              unit_num = if self.assigned_unit =~ /\A\d+\z/
                self.assigned_unit.to_i
              elsif workspace.unit_names.is_a?(Array)
                (workspace.unit_names.index { |n| n.to_s.downcase == self.assigned_unit.to_s.downcase } || 0) + 1
              else
                1
              end
              
              if base_prefix =~ /\A(.*?)(0*\d+)\z/
                prefix_base = $1
                num_str = $2
                val = num_str.to_i + unit_num - 1
                formatted_num = sprintf("%0#{num_str.length}d", val)
                unit_prefix = "#{prefix_base}#{formatted_num}"
              else
                if unit_num > 1
                  unit_prefix = "#{base_prefix}-#{unit_num}"
                else
                  unit_prefix = base_prefix
                end
              end
            else
              unit_prefix = base_prefix
            end
          end
        end

        prefix = unit_prefix || workspace.qr_prefix.presence || workspace.prefix.presence || "BK"
      end
    end

    max_num = 0
    Booking.where(space: self.space).find_each do |b|
      if b.qr_code.present? && b.qr_code.start_with?(prefix)
        sub = b.qr_code[prefix.length, 4]
        if sub =~ /\A\d{4}\z/
          num = sub.to_i
          max_num = num if num > max_num
        end
      end
    end
    
    next_num = max_num + 1
    formatted_num = sprintf("%04d", next_num)
    random_letters = Array.new(10) { ('A'..'Z').to_a.sample }.join
    
    self.qr_code ||= "#{prefix}#{formatted_num}-#{random_letters}"
  end
end
