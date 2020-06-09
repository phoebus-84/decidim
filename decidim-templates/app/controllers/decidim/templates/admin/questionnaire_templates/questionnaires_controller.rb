# frozen_string_literal: true

module Decidim
  module Templates
    module Admin
      module QuestionnaireTemplates
        # This controller allows an admin to manage a questionnaire form for a questionnaire_template
        class QuestionnairesController < Admin::ApplicationController
          include Decidim::Forms::Admin::Concerns::HasQuestionnaire

          helper Decidim::Admin::ExportsHelper

          def questionnaire_for
            template
          end

          def update_url
            questionnaire_templates_questionnaire_path(template_id: template.id)
          end

          def after_update_url
            edit_questionnaire_template_path(id: template.id)
          end

          private

          def template
            @template ||= Template.find(params[:template_id])
          end
        end
      end
    end
  end
end
