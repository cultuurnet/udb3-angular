'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasInfoController
 * @description
 * # EventFormUitpasInfoController
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.uitpas')
  .component('uitpasInfo', {
    templateUrl: 'templates/uitpasInfo.html',
    controller: UitpasInfoComponent,
    controllerAs: 'upic',
    bindings: {
      organizer: '<',
      price: '<'
    }
  });

/* @ngInject */
function UitpasInfoComponent(
  $scope,
  $rootScope,
  EventFormData
) {
  var controller = this;

  $scope.showUitpasInfo = false;
  $scope.uitpasCssClass = 'state-incomplete';
  controller.listeners = [];
  controller.showCardSystems = false;

  controller.$onInit = init;
  controller.$onDestroy = destroy;

  /**
   *
   * @param {Object} angularEvent
   * @param {EventFormData} offerData
   */
  controller.showCardSystemsIfPriceIsSelected = function(angularEvent, offerData) {
    controller.showCardSystems = offerData.priceInfo && !!offerData.priceInfo.length;
  };

  controller.markUitpasDataAsCompleted = function () {
    $scope.uitpasCssClass = 'state-complete';
  };

  controller.updateOrganizer = function (angularEvent, organization) {
    controller.organizer = organization;
    showOrganizer(organization);
  };

  function showOrganizer(organization) {
    if (organization) {
      $scope.showUitpasInfo = _.get(controller, 'organizer.isUitpas', false) && EventFormData.isEvent;
      controller.showCardSystems = controller.price && !!controller.price.length;
    } else {
      controller.showCardSystems = false;
      $scope.showUitpasInfo = false;
    }
  }

  function init() {
    controller.eventFormData = EventFormData;
    showOrganizer(controller.organizer);

    controller.listeners = [
      $rootScope.$on('eventFormSaved', controller.showCardSystemsIfPriceIsSelected),
      $rootScope.$on('eventOrganizerSelected', controller.updateOrganizer),
      $rootScope.$on('eventOrganizerDeleted', controller.updateOrganizer),
      $rootScope.$on('uitpasDataSaved', controller.markUitpasDataAsCompleted)
    ];
  }

  function destroy() {
    _.invoke(controller.listeners, 'call');
  }
}
