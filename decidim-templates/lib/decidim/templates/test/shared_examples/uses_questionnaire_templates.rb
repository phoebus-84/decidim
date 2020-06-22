# frozen_string_literal: true

require "spec_helper"

shared_examples_for "uses questionnaire templates" do |questionnaire_for|
  describe "choose a template" do
    context "when there are no templates" do
      before do
        questionnaire.update_columns(
          created_at: Time.now - 1.day,
          updated_at: Time.now
        )
      end

      it "doesn't show the template selection screen" do
        expect(page).to have_no_content("Choose template")
      end
    end

    context "when there are templates" do
      let!(:templates) { create_list(:questionnaire_template, 6, organization: questionnaire.questionnaire_for.organization) }
      let(:template) { templates.first }
      let(:question) { template.templatable.questions.first }
      
      context "when it is an existing questionnaire" do
        before do
          questionnaire.update_columns(
            created_at: Time.now - 1.day,
            updated_at: Time.now
          )
        end
  
        it "doesn't show the template selection screen" do
          expect(page).to have_no_content("Choose template")
        end
      end
  
      context "when it is a newly created questionnaire" do
        before do
          questionnaire.update_columns(
            created_at: Time.now,
            updated_at: Time.now,
            title: {},
            description: {},
            tos: {}
          )
          visit questionnaire_edit_path
        end
    
        it "shows the template choosing screen" do
          expect(page).to have_content("Choose template")
        end
        
        it "loads the last 5 templates in the select" do
          page.find(".Select-control").click
          
          within ".Select-menu" do
            expect(page).to have_selector(".Select-option:not(.is-focused)", count: 5)
          end
        end
    
        it "displays the preview when a template is selected" do
          autocomplete_select template.name["en"], from: :questionnaire_template_id
          within ".questionnaire-template-preview" do
            expect(page).to have_i18n_content(template.name)
            expect(page).to have_i18n_content(question.body)
          end
        end
      end
    end
  end
end
