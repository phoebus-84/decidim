# frozen_string_literal: true

require "decidim/faker/localized"
require "decidim/dev"

FactoryBot.define do
  factory :template, class: "Decidim::Templates::Template" do
    organization
    templatable { build(:dummy_resource) }
    name { Decidim::Faker::Localized.sentence }

    factory :questionnaire_template do
      after(:create) do |template|
        template.templatable = create(:questionnaire, :with_questions, questionnaire_for: template)
        template.save!
      end
    end
  end
end
