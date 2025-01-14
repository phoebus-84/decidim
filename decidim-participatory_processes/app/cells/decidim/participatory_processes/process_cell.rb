# frozen_string_literal: true

module Decidim
  module ParticipatoryProcesses
    # This cell renders the process card for an instance of a Process
    # the default size is the Grid Card (:g)
    class ProcessCell < Decidim::ViewModel
      def show
        cell card_size, model, options
      end

      private

      def card_size
        case @options[:size]
        when :s
          "decidim/participatory_processes/process_s"
        when :l
          "decidim/participatory_processes/process_l"
        else
          "decidim/participatory_processes/process_g"
        end
      end
    end
  end
end
