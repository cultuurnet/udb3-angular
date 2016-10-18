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
function OrganisationSuggestionController($scope, UitpasLabels) {
  var controller = this;
  controller.organisation = $scope.organisation;
  controller.query = $scope.query;

  controller.isUitpas = !_.isEmpty(_.intersection(
    _.pluck($scope.organisation.labels, 'name'),
    _.values(UitpasLabels)
  ));
}
