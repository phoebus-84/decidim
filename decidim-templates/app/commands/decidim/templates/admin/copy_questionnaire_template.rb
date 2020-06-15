# frozen_string_literal: true

module Decidim
  module Templates
    # A command with all the business logic when duplicating a questionnaire template
    module Admin
      class CopyQuestionnaireTemplate < Rectify::Command
        # Public: Initializes the command.
        #
        # form - A form object with the params.
        # template - A template we want to duplicate
        def initialize(template)
          @template = template
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid.
        # - :invalid if the form wasn't valid and we couldn't proceed.
        #
        # Returns nothing.
        def call
          Template.transaction do
            copy_template
            copy_questionnaire_questions(@template.templatable, @copied_template.templatable)
          end

          broadcast(:ok, @copied_template)
        end

        private

        attr_reader :form

        def copy_template
          @copied_template = Template.create!(
            organization: @template.organization,
            name: @template.name,
            description: @template.description
          )
          @resource = Decidim::Forms::Questionnaire.create!(
            @template.templatable.dup.attributes.merge(
              questionnaire_for: @copied_template
            )
          )

          @copied_template.update!(templatable: @resource)
        end

        def copy_questionnaire_questions(original_questionnaire, new_questionnaire)
          original_questionnaire.questions.each do |original_question|
            new_question = original_question.dup
            new_question.questionnaire = new_questionnaire
            new_question.save!
            copy_questionnaire_answer_options(original_question, new_question)
            copy_questionnaire_matrix_rows(original_question, new_question)
          end
        end

        def copy_questionnaire_answer_options(original_question, new_question)
          original_question.answer_options.each do |original_answer_option|
            new_answer_option = original_answer_option.dup
            new_answer_option.question = new_question
            new_answer_option.save!
          end
        end

        def copy_questionnaire_matrix_rows(original_question, new_question)
          original_question.matrix_rows.each do |original_matrix_row|
            new_matrix_row = original_matrix_row.dup
            new_matrix_row.question = new_question
            new_matrix_row.save!
          end
        end
      end
    end
  end
end
