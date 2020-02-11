// = require ./auto_buttons_by_min_items.component
// = require ./auto_select_options_by_total_items.component

((exports) => {
  const { AutoLabelByPositionComponent, AutoButtonsByPositionComponent, AutoButtonsByMinItemsComponent, AutoSelectOptionsByTotalItemsComponent, createFieldDependentInputs, createDynamicFields, createSortList } = exports.DecidimAdmin;
  const { createQuillEditor } = exports.Decidim;

  const wrapperSelector = ".questionnaire-questions";
  const fieldSelector = ".questionnaire-question";
  const questionTypeSelector = "select[name$=\\[question_type\\]]";
  const answerOptionFieldSelector = ".questionnaire-question-answer-option";
  const answerOptionsWrapperSelector = ".questionnaire-question-answer-options";
  const answerOptionRemoveFieldButtonSelector = ".remove-answer-option";
  const maxChoicesWrapperSelector = ".questionnaire-question-max-choices";
  
  const displayConditionQuestionSelector = "select[name$=\\[condition_question\\]]";
  const displayConditionTypeSelector = "select[name$=\\[condition_type\\]]";
  const displayConditionAnswerOptionSelector = "select[name$=\\[answer_option\\]]";
  const displayConditionFieldSelector = ".questionnaire-question-display-condition";
  const displayConditionsWrapperSelector = ".questionnaire-question-display-conditions";
  const displayConditionRemoveFieldButtonSelector = ".remove-display-condition";
  const conditionValueWrapperSelector = ".questionnaire-question-display-condition-value";
  const conditionAnswerOptionWrapperSelector = ".questionnaire-question-display-condition-answer-option";

  const autoLabelByPosition = new AutoLabelByPositionComponent({
    listSelector: ".questionnaire-question:not(.hidden)",
    labelSelector: ".card-title span:first",
    onPositionComputed: (el, idx) => {
      $(el).find("input[name$=\\[position\\]]").val(idx);
    }
  });

  const autoButtonsByPosition = new AutoButtonsByPositionComponent({
    listSelector: ".questionnaire-question:not(.hidden)",
    hideOnFirstSelector: ".move-up-question",
    hideOnLastSelector: ".move-down-question"
  });

  const createAutoMaxChoicesByNumberOfAnswerOptions = (fieldId) => {
    return new AutoSelectOptionsByTotalItemsComponent({
      wrapperSelector: fieldSelector,
      selectSelector: `${maxChoicesWrapperSelector} select`,
      listSelector: `#${fieldId} ${answerOptionsWrapperSelector} .questionnaire-question-answer-option:not(.hidden)`
    })
  };

  const createAutoButtonsByMinItemsForAnswerOptions = (fieldId) => {
    return new AutoButtonsByMinItemsComponent({
      wrapperSelector: fieldSelector,
      listSelector: `#${fieldId} ${answerOptionsWrapperSelector} .questionnaire-question-answer-option:not(.hidden)`,
      minItems: 2,
      hideOnMinItemsOrLessSelector: answerOptionRemoveFieldButtonSelector
    })
  };

  const createSortableList = () => {
    createSortList(".questionnaire-questions-list:not(.published)", {
      handle: ".question-divider",
      placeholder: '<div style="border-style: dashed; border-color: #000"></div>',
      forcePlaceholderSize: true,
      onSortUpdate: () => { autoLabelByPosition.run() }
    });
  };

  const setupDisplayConditionInputs = ($field) => {
    const $conditionTypeSelect = $field.find(displayConditionTypeSelector);
    const $questionSelect = $field.find(displayConditionQuestionSelector);
    const $answerOptionSelect = $field.find(displayConditionAnswerOptionSelector);

    const url = $questionSelect.data("url");
    
    $questionSelect.on("change", (event) => {
      const questionId = event.target.value;

      $.getJSON(
        url,
        { id: questionId },
        function(data) {
          $answerOptionSelect.find("option").remove();

          data.forEach((answerOption) => {
            $(`<option value="${answerOption.id}">${answerOption.body}</option>`).appendTo($answerOptionSelect);
          });
        }
      );
    });

    /* Create value input for display condition */
    createFieldDependentInputs({
      controllerField: $conditionTypeSelect,
      wrapperSelector: fieldSelector,
      dependentFieldsSelector: conditionValueWrapperSelector,
      dependentInputSelector: "select",
      enablingCondition: ($field) => {
        return $field.val() === "match"
      }
    });
    
    /* Create answer option select for display condition */
    createFieldDependentInputs({
      controllerField: $conditionTypeSelect,
      wrapperSelector: fieldSelector,
      dependentFieldsSelector: conditionAnswerOptionWrapperSelector,
      dependentInputSelector: "select",
      enablingCondition: ($field) => {
        return $field.val() === "equal" || $field.val() === "not_equal"
      }
    });

  };

  const createDynamicFieldsForDisplayConditions = (fieldId) => {
    return createDynamicFields({
      placeholderId: "questionnaire-question-display-condition-id",
      wrapperSelector: `#${fieldId} ${displayConditionsWrapperSelector}`,
      containerSelector: ".questionnaire-question-display-conditions-list",
      fieldSelector: displayConditionFieldSelector,
      addFieldButtonSelector: ".add-display-condition",
      removeFieldButtonSelector: displayConditionRemoveFieldButtonSelector,
      onAddField: ($field) => {
        setupDisplayConditionInputs($field);
      },
      onRemoveField: () => {
      }
    });
  };

  const dynamicFieldsForDisplayConditions = {};

  const createDynamicFieldsForAnswerOptions = (fieldId) => {
    const autoButtons = createAutoButtonsByMinItemsForAnswerOptions(fieldId);
    const autoSelectOptions = createAutoMaxChoicesByNumberOfAnswerOptions(fieldId);

    return createDynamicFields({
      placeholderId: "questionnaire-question-answer-option-id",
      wrapperSelector: `#${fieldId} ${answerOptionsWrapperSelector}`,
      containerSelector: ".questionnaire-question-answer-options-list",
      fieldSelector: answerOptionFieldSelector,
      addFieldButtonSelector: ".add-answer-option",
      removeFieldButtonSelector: answerOptionRemoveFieldButtonSelector,
      onAddField: () => {
        autoButtons.run();
        autoSelectOptions.run();
      },
      onRemoveField: () => {
        autoButtons.run();
        autoSelectOptions.run();
      }
    });
  };

  const dynamicFieldsForAnswerOptions = {};

  const isMultipleChoiceOption = ($selectField) => {
    const value = $selectField.val();

    return value === "single_option" || value === "multiple_option" || value === "sorting"
  }

  const setupInitialQuestionAttributes = ($target) => {
    const fieldId = $target.attr("id");
    const $fieldQuestionTypeSelect = $target.find(questionTypeSelector);

    createFieldDependentInputs({
      controllerField: $fieldQuestionTypeSelect,
      wrapperSelector: fieldSelector,
      dependentFieldsSelector: answerOptionsWrapperSelector,
      dependentInputSelector: `${answerOptionFieldSelector} input`,
      enablingCondition: ($field) => {
        return isMultipleChoiceOption($field);
      }
    });

    createFieldDependentInputs({
      controllerField: $fieldQuestionTypeSelect,
      wrapperSelector: fieldSelector,
      dependentFieldsSelector: maxChoicesWrapperSelector,
      dependentInputSelector: "select",
      enablingCondition: ($field) => {
        return $field.val() === "multiple_option"
      }
    });

    dynamicFieldsForAnswerOptions[fieldId] = createDynamicFieldsForAnswerOptions(fieldId);
    dynamicFieldsForDisplayConditions[fieldId] = createDynamicFieldsForDisplayConditions(fieldId);

    const dynamicFields = dynamicFieldsForAnswerOptions[fieldId];

    const onQuestionTypeChange = () => {
      if (isMultipleChoiceOption($fieldQuestionTypeSelect)) {
        const nOptions = $fieldQuestionTypeSelect.parents(fieldSelector).find(answerOptionFieldSelector).length;

        if (nOptions === 0) {
          dynamicFields._addField();
          dynamicFields._addField();
        }
      }
    };
    
    $fieldQuestionTypeSelect.on("change", onQuestionTypeChange);

    onQuestionTypeChange();
  }

  const hideDeletedQuestion = ($target) => {
    const inputDeleted = $target.find("input[name$=\\[deleted\\]]").val();

    if (inputDeleted === "true") {
      $target.addClass("hidden");
      $target.hide();
    }
  }

  createDynamicFields({
    placeholderId: "questionnaire-question-id",
    wrapperSelector: wrapperSelector,
    containerSelector: ".questionnaire-questions-list",
    fieldSelector: fieldSelector,
    addFieldButtonSelector: ".add-question",
    removeFieldButtonSelector: ".remove-question",
    moveUpFieldButtonSelector: ".move-up-question",
    moveDownFieldButtonSelector: ".move-down-question",
    onAddField: ($field) => {
      setupInitialQuestionAttributes($field);
      createSortableList();

      $field.find(".editor-container").each((idx, el) => {
        createQuillEditor(el);
      });

      autoLabelByPosition.run();
      autoButtonsByPosition.run();
    },
    onRemoveField: ($field) => {
      autoLabelByPosition.run();
      autoButtonsByPosition.run();

      $field.find(answerOptionRemoveFieldButtonSelector).each((idx, el) => {
        dynamicFieldsForAnswerOptions[$field.attr("id")]._removeField(el);
      });
    },
    onMoveUpField: () => {
      autoLabelByPosition.run();
      autoButtonsByPosition.run();
    },
    onMoveDownField: () => {
      autoLabelByPosition.run();
      autoButtonsByPosition.run();
    }
  });

  createSortableList();

  $(fieldSelector).each((idx, el) => {
    const $target = $(el);

    hideDeletedQuestion($target);
    setupInitialQuestionAttributes($target);
  });

  autoLabelByPosition.run();
  autoButtonsByPosition.run();
})(window);
