'use strict';

/**
 * @ngdoc function
 * @name udb.event-form:FormAgeController
 * @description
 * # FormAgeController
 * Controller for the form age component
 */
angular
  .module('udb.event-form')
  .controller('FormAgeController', FormAgeController);

/* @ngInject */
function FormAgeController(EventFormData, eventCrud) {
  var controller = this;
  /**
   * Enum for age ranges.
   * @readonly
   * @enum {Object}
   */
  var AgeRangeEnum = Object.freeze({
    'ALL': {label: 'Alle leeftijden'},
    'TODDLERS': {label: 'Peuters', min: 0, max: 2},
    'PRESCHOOLERS': {label: 'Kleuters', min: 3, max: 5},
    'KIDS': {label: 'Kinderen', min: 6, max: 11},
    'YOUNGSTERS': {label: 'Jongeren', min: 12, max: 17},
    'ADULTS': {label: 'Volwassenen', min: 18},
    'SENIORS': {label: 'Senioren', min: 65},
    'CUSTOM': {label: 'Andere'}
  });

  controller.ageRanges = angular.copy(AgeRangeEnum);
  controller.activeAgeRange = undefined;
  controller.minAge = undefined;
  controller.maxAge = undefined;
  controller.setAgeRangeByType = setAgeRangeByType;
  controller.saveAgeRange = _.debounce(saveAgeRange, 300);
  controller.error = '';

  init(EventFormData);

  /**
   * Save the age range based on current controller min and max values.
   */
  function saveAgeRange() {
    clearError();
    var min = controller.minAge;
    var max = controller.maxAge;

    if (_.isNumber(min) && _.isNumber(max) && min >= max) {
      showError('De minimum ouderdom moet lager zijn dan maximum.'); return;
    }

    EventFormData.setTypicalAgeRange(min, max);
    eventCrud.updateTypicalAgeRange(EventFormData);
  }

  function showError() {
    controller.error = 'De minimum ouderdom moet lager zijn dan maximum.';
  }

  function clearError() {
    controller.error = '';
  }

  /**
   * Create a matcher with a min and max age that takes an age range object.
   *
   * @param {number} min
   * @param {number} max
   * @returns {Function}
   */
  function rangeMatcher(min, max) {
    return function (ageRange) {
      var fixedRange = (ageRange.min === min && ageRange.max === max);
      var customRange = !(isNaN(min) && isNaN(max)) && ageRange === AgeRangeEnum.CUSTOM;

      return fixedRange ? fixedRange : customRange;
    };
  }

  /**
   * @param {EventFormData} formData
   */
  function init(formData) {
    if (_.isEmpty(formData.typicalAgeRange)) {
      return;
    }

    var rangeArray = formData.typicalAgeRange.split('-');
    var minAge = rangeArray[0] ? parseInt(rangeArray[0]) : undefined;
    var maxAge = rangeArray[1] ? parseInt(rangeArray[1]) : undefined;

    showRange(minAge, maxAge);
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  function showRange(min, max) {
    var activeAgeRangeType = _.findKey(AgeRangeEnum, rangeMatcher(min, max));
    controller.minAge = min;
    controller.maxAge = max;
    controller.rangeInputEnabled = activeAgeRangeType && activeAgeRangeType !== 'ALL';
    controller.activeAgeRange = activeAgeRangeType;
  }

  /**
   * @param {string} type
   */
  function setAgeRangeByType(type) {
    var ageRange = AgeRangeEnum[type];

    if (ageRange) {
      controller.minAge = ageRange.min;
      controller.maxAge = ageRange.max;
      controller.rangeInputEnabled = type !== 'ALL';
      controller.activeAgeRange = type;

      saveAgeRange();
    }
  }
}
