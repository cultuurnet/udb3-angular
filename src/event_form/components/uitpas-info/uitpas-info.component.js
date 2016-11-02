'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasInfoController
 * @description
 * # EventFormUitpasInfoController
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.event-form')
  .component('uitpasInfo', {
    templateUrl: 'templates/uitpasInfo.html',
    controller: UitpasInfoComponent,
    controllerAs: 'upic',
    bindings: {
      organizer: '<',
      price: '<',
      uitpasData: '='
    }
  });

/* @ngInject */
function UitpasInfoComponent($scope,
                             $rootScope,
                             EventFormData,
                             udbOrganizers,
                             eventCrud,
                             $uibModal) {

  var controller = this;

  $scope.showUitpasInfo = false;
  $scope.uitpasCssClass = 'state-incomplete';
  $scope.savingUitpas = false;
  $scope.hasUitpasData = false;
  $scope.checkedCardSystems = [];
  $scope.openUitpasModal = openUitpasModal;

  init();

  /**
   * Open the UiTPAS modal.
   */
  function openUitpasModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-uitpas-modal.html',
      controller: 'EventFormUitpasModalController',
      resolve: {
        organizer: function () {
          return controller.organizer;
        },
        organizerCardSystems: function () {
          return controller.organizerCardSystems;
        },
        checkedCardSystems: function () {
          return $scope.checkedCardSystems;
        }
      }
    });

    function updateUitpasInfo () {
      if (!_.isEmpty(EventFormData.usedDistributionKeys)) {
        $scope.uitpasCssClass = 'state-complete';
      }
      else {
        $scope.uitpasCssClass = 'state-incomplete';
      }
    }

    modalInstance.result.then(controller.saveUitpasData, updateUitpasInfo);
  }

  /**
   * Persist uitpasData for the active event.
   * @param {Object} checkedCardSystems
   */
  controller.saveUitpasData = function(checkedCardSystems) {
    controller.checkedCardSystems = checkedCardSystems;
    checkHasUitpasData();

    function markUitpasDataAsCompleted() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      $scope.uitpasCssClass = 'state-complete';
      $scope.savingUitpas = false;
    }

    function showAsyncUitpasError() {
      $scope.uitpasError = true;
      $scope.savingUitpas = false;
    }

    var distributionKeys = [];
    angular.forEach(checkedCardSystems, function(cardSystem) {
      distributionKeys.push = cardSystem.distributionKeyId;
    });

    EventFormData.uitpasData = checkedCardSystems;
    EventFormData.usedDistributionKeys = distributionKeys;

    $scope.savingUitpas = true;
    eventCrud
      .updateEventUitpasData(EventFormData)
      .then(markUitpasDataAsCompleted, showAsyncUitpasError);
  };

  function checkHasUitpasData() {
    if (!_.isEmpty(controller.checkedCardSystems)) {
      $scope.hasUitpasData = true;
    }
    else {
      $scope.hasUitpasData = false;
    }
  }

  function init() {
    if (controller.organizer.isUitpas && EventFormData.isEvent) {
      $scope.showUitpasInfo = true;
    }

    if ($scope.showUitpasInfo) {
      udbOrganizers
        .findOrganizersCardsystem(controller.organizer.id)
        .then(function(response) {
          controller.organizerCardSystems = response;
        });
      getUitpasData(EventFormData.id);
    }
  }

  /**
   * Get the Uitpas Data for an event
   */
  function getUitpasData(cdbid) {
    eventCrud
      .getEventUitpasData(cdbid)
      .then(function(data) {
        $scope.usedDistributionKeys = data;
        EventFormData.usedDistributionKeys = data;
        $scope.hasUitpasData = true;
        reverseLookUp();
      });
  }

  function reverseLookUp() {
    angular.forEach(controller.organizerCardSystems, function (cardSystem, index) {
      angular.forEach($scope.usedDistributionKeys, function(distributionKey) {
        var tempDistKey = _.findWhere(cardSystem.distributionKeys, {id: distributionKey});
        if (tempDistKey !== undefined) {
          $scope.checkedCardSystems[index] = {
            distributionKeyId: tempDistKey.id,
            distributionKeyName: tempDistKey.name,
            cardSystemId: cardSystem.id,
            cardSystemName: cardSystem.name
          };
        }
      });
    });
  }

  $rootScope.$on('eventOrganizerSelected', function () {
    init();
  });
}
