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
      price: '<'
    }
  });

/* @ngInject */
function UitpasInfoComponent($scope, EventFormData, udbOrganizers, $uibModal) {

  var controller = this;

  $scope.showUitpasInfo = false;
  $scope.uitpasCssClass = 'state-incomplete';
  $scope.savingUitpas = false;
  $scope.hasUitpasData = false;
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
        }/*,
        cardSystem: function () {
          return $scope.usedCardSystem;
        },
        distributionKey: function () {
          return $scope.usedDistributionKey;
        }*/
      }
    });

    function updateUitpasInfo () {
      if (EventFormData.uitpasData.distributionKeyId) {
        $scope.uitpasCssClass = 'state-complete';
      }
      else {
        $scope.uitpasCssClass = 'state-incomplete';
      }
    }

    modalInstance.result.then(controller.saveUitpasData, updateUitpasInfo);
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
    }
  }
}