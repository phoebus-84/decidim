# frozen_string_literal: true

require "wicked_pdf"
require "decidim/translations_helper"
require "decidim/forms/admin/questionnaire_answers_helper"

module Decidim
  module Exporters
    # Inherits from abstract PDF exporter. This class is used to set
    # the parameters used to create a PDF when exporting Survey Answers.
    #
    class FormPDF < PDF
      # i18n-tasks-use t('decidim.admin.exports.formats.FormPDF')

      def controller
        super.class_eval do
          helper Decidim::TranslationsHelper
          helper Decidim::Forms::Admin::QuestionnaireAnswersHelper
        end
        super
      end

      def template
        "decidim/forms/admin/questionnaires/answers/export/pdf.html.erb"
      end

      def layout
        "decidim/forms/admin/questionnaires/questionnaire_answers.html.erb"
      end

      def locals
        {
          questionnaire: collection.first.first.questionnaire,
          collection: collection.map { |answer| Decidim::Forms::Admin::QuestionnaireParticipantPresenter.new(participant: answer.first) }
        }
      end
    end
  end
end
