#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

module Redmine
  module Acts
    module Customizable
      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        def acts_as_customizable(options = {})
          return if included_modules.include?(Redmine::Acts::Customizable::InstanceMethods)
          cattr_accessor :customizable_options
          self.customizable_options = options
          has_many :custom_values, as: :customized,
                                   include: :custom_field,
                                   order: "#{CustomField.table_name}.position",
                                   dependent: :delete_all
          before_validation { |customized| customized.custom_field_values if customized.new_record? }
          # Trigger validation only if custom values were changed
          validates_associated :custom_values, on: :update,
                                               if: -> (customized) { customized.custom_field_values_changed? }
          send :include, Redmine::Acts::Customizable::InstanceMethods
          # Save custom values when saving the customized object
          after_save :save_custom_field_values
        end
      end

      module InstanceMethods
        def self.included(base)
          base.extend ClassMethods
        end

        def available_custom_fields
          CustomField.find(:all, conditions: "type = '#{self.class.name}CustomField'",
                                 order: 'position')
        end

        # Sets the values of the object's custom fields
        # values is an array like [{'id' => 1, 'value' => 'foo'}, {'id' => 2, 'value' => 'bar'}]
        def custom_fields=(values)
          values_to_hash = values.inject({}) do |hash, v|
            v = v.stringify_keys
            if v['id'] && v.has_key?('value')
              hash[v['id']] = v['value']
            end
            hash
          end
          self.custom_field_values = values_to_hash
        end

        # Sets the values of the object's custom fields
        # values is a hash like {'1' => 'foo', 2 => 'bar'}
        def custom_field_values=(values)
          @custom_field_values_changed = true
          values = values.stringify_keys
          custom_field_values.each do |custom_value|
            custom_value.value = values[custom_value.custom_field_id.to_s] if values.has_key?(custom_value.custom_field_id.to_s)
          end if values.is_a?(Hash)
        end

        def custom_field_values
          @custom_field_values ||= available_custom_fields.map { |x| custom_values.detect { |v| v.custom_field == x } || custom_values.build(customized: self, custom_field: x, value: nil) }
        end

        def visible_custom_field_values
          custom_field_values.select(&:visible?)
        end

        def custom_field_values_changed?
          @custom_field_values_changed == true
        end

        def custom_value_for(c)
          field_id = (c.is_a?(CustomField) ? c.id : c.to_i)
          custom_values.detect { |v| v.custom_field_id == field_id }
        end

        def save_custom_field_values
          self.custom_values = custom_field_values
          custom_field_values.each(&:save)
          @custom_field_values_changed = false
          @custom_field_values = nil
        end

        def reset_custom_values!
          @custom_field_values = nil
          @custom_field_values_changed = true
          values = custom_values.inject({}) { |h, v| h[v.custom_field_id] = v.value; h }
          custom_values.each { |cv| cv.destroy unless custom_field_values.include?(cv) }
        end

        module ClassMethods
        end
      end
    end
  end
end
