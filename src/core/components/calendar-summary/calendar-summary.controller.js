'use strict';

angular
  .module('udb.core')
  .controller('CalendarSummaryController', calendarSummaryController);

function calendarSummaryController($scope, $translate) {
  $scope.getOpeningHoursCount = function(offer) {
    if (offer.calendarType === 'single' && offer.startDate !== offer.endDate) {
      offer.openingHours = [{
        startDate: offer.startDate,
        endDate: offer.endDate
      }];
    }
    return offer.openingHours.length;
  };

  $scope.translateCalendarSummary = function (label) {
    return $translate.instant('calendarSummary.' + label);
  };
}
