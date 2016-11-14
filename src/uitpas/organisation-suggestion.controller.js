'use strict';

/**
 * @ngdoc directive
 * @name udb.search.controller:OfferController
 * @description
 * # OfferController
 */
angular
  .module('udb.uitpas')
  .controller('OrganisationSuggestionController', OrganisationSuggestionController);

/* @ngInject */
function OrganisationSuggestionController($scope) {
  var controller = this;
  controller.organisation = $scope.organisation;
  controller.query = $scope.query;
}
