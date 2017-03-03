'use strict';

/**
 * @ngdoc function
 * @name udb.event-form:FormAudienceController
 * @description
 * # FormAudienceController
 * Controller for the form audience component
 */
angular
  .module('udb.event-form')
  .controller('FormAudienceController', FormAudienceController);

/* @ngInject */
function FormAudienceController(EventFormData, eventCrud) {
  var controller = this;
  /**
   * Enum for age ranges.
   * @readonly
   * @enum {Object}
   */
  var AgeRangeEnum = Object.freeze({
    'ALL': {'value': 0, 'label': 'Alle leeftijden'},
    'KIDS': {'value': 12, 'label': 'Kinderen tot 12 jaar', min: 0, max: 12},
    'TEENS': {'value': 18, 'label': 'Jongeren tussen 12 en 18 jaar', min: 13, max: 18},
    'ADULTS': {'value': 99, 'label': 'Volwassenen (+18 jaar)', min: 19, max: 99}
  });

  // Age range vars
  $scope.savingAgeRange = false;
  $scope.ageRangeError = false;
  $scope.invalidAgeRange = false;
  /**
   * @type {AgeRangeEnum|null}
   */
  $scope.ageRange = null;
  $scope.ageCssClass = EventFormData.typicalAgeRange ? 'state-complete' : 'state-incomplete';
  /**
   * * @type {number|null}
   */
  $scope.minAge = null;

  // Age range functions.
  $scope.saveAgeRange = saveAgeRange;
  $scope.ageRangeChanged = ageRangeChanged;
  $scope.setAllAges = setAllAges;
  $scope.resetAgeRange = resetAgeRange;

  $scope.ageRanges = _.map(AgeRangeEnum, function (range) {
    return range;
  });

  $scope.AgeRange = AgeRangeEnum;


  /**
   * Listener on the age range selection.
   * @param {AgeRangeEnum} ageRange
   */
  function ageRangeChanged(ageRange) {
    $scope.minAge = null;
    $scope.ageCssClass = 'state-complete';

    $scope.saveAgeRange();
  }

  /**
   * @param {number} minAge
   * @param {number} [maxAge]
   *
   * @return {string}
   */
  function formatTypicalAgeRange(minAge, maxAge) {
    var formattedAgeRange = '';

    if (maxAge) {
      formattedAgeRange = minAge === maxAge ? minAge.toString() : minAge + '-' + maxAge;
    } else {
      formattedAgeRange = minAge + '-';
    }

    return formattedAgeRange;
  }

  /**
   * @param {number} minAge
   * @param {AgeRangeEnum} ageRange
   *
   * @return {boolean}
   */
  function isMinimumAgeInRange(minAge, ageRange) {
    var inRange = true;

    if (ageRange.max && minAge > ageRange.max) {
      inRange = false;
    }

    if (ageRange.min && minAge < ageRange.min) {
      inRange = false;
    }

    return inRange;
  }

  /**
   * Save the age range.
   */
  function saveAgeRange() {

    $scope.invalidAgeRange = false;

    if ($scope.ageRange === AgeRangeEnum.ALL) {
      EventFormData.typicalAgeRange = null;
    }
    else {
      if ($scope.minAge) {
        $scope.invalidAgeRange = !isMinimumAgeInRange($scope.minAge, $scope.ageRange);
      }

      EventFormData.typicalAgeRange = formatTypicalAgeRange(
        $scope.minAge || $scope.ageRange.min,
        $scope.ageRange.max
      );
    }

    // Save to db if valid age entered.
    if (!$scope.invalidAgeRange) {
      var ageRangePersisted = null;

      var showAgeRangeError = function() {
        $scope.savingAgeRange = false;
        $scope.ageRangeError = true;
      };

      var markAgeRangeAsUpdated = function () {
        $scope.savingAgeRange = false;
        controller.eventFormSaved();
        $scope.ageCssClass = 'state-complete';
      };

      if ($scope.ageRange === AgeRangeEnum.ALL) {
        ageRangePersisted = eventCrud.deleteTypicalAgeRange(EventFormData);
      }
      else {
        ageRangePersisted = eventCrud.updateTypicalAgeRange(EventFormData);
      }

      ageRangePersisted.then(markAgeRangeAsUpdated, showAgeRangeError);
    }

  }

  /**
   * Set to all ages.
   */
  function setAllAges() {
    $scope.ageRange = AgeRangeEnum.ALL;
  }

  /**
   * Reset the age selection.
   */
  function resetAgeRange() {
    $scope.ageRange = null;
    $scope.minAge = null;
    $scope.ageCssClass = 'state-incomplete';
  }

  function init() {
    // On edit set state default to complete.
    if (EventFormData.id) {
      $scope.ageCssClass = 'state-complete';
      var minAge, maxAge;

      if (EventFormData.typicalAgeRange) {
        if (typeof EventFormData.typicalAgeRange === 'string') {
          var rangeArray = EventFormData.typicalAgeRange.split('-');
          minAge = rangeArray[0] ? parseInt(rangeArray[0]) : null;
          maxAge = rangeArray[1] ? parseInt(rangeArray[1]) : null;
        }
        else {
          minAge = EventFormData.typicalAgeRange;
        }

        if (typeof minAge === 'number') {
          $scope.minAge = minAge;
          if (maxAge) {
            $scope.ageRange = _.findWhere(AgeRangeEnum, {max: maxAge});
          }
          else {
            $scope.ageRange = _.find(AgeRangeEnum, function (ageRange) {
              // ignore AgeRangeEnum.ALL which has value zero because it will match anything
              return ageRange.value && isMinimumAgeInRange(minAge, ageRange);
            });
          }
        }
      }
      else {
        $scope.minAge = 0;
        $scope.ageRange = AgeRangeEnum.ALL;
      }
    }
  }
}
