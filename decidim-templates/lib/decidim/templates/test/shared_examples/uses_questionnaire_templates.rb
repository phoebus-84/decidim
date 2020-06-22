# frozen_string_literal: true

require "spec_helper"

shared_examples_for "uses questionnaire templates" do |questionnaire_for|
  describe "choose a template" do
    let!(:template) { create(:questionnaire_template, organization: questionnaire.questionnaire_for.organization) }
    let(:question) { template.templatable.questions.first }

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
    
    it "loads the last 5 templates in the select"

    it "displays the preview when a template is selected" do
      autocomplete_select template.name["en"], from: :questionnaire_template_id
      within ".questionnaire-template-preview" do
        expect(page).to have_i18n_content(template.name)
        expect(page).to have_i18n_content(question.body)
      end
    end
  end
end
