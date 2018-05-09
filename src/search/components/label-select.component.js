'use strict';

angular
  .module('udb.search')
  .component('udbLabelSelect', {
    templateUrl: 'templates/label-select.html',
    controller: LabelSelectComponent,
    controllerAs: 'select',
    bindings: {
      labels: '<',
      labelAdded: '&',
      labelRemoved: '&'
    }
  });

/** @ngInject */
function LabelSelectComponent($scope, offerLabeller, $q) {

  var select = this;

  $scope.cachedLabels = select.labels;
  $scope.currentLabel = '';

  $scope.regex = /^([a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{1}[a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ_-\s]+)$/;

  $scope.findSuggestions = function(name) {
    if ($scope.regex.test(name)) {
      return offerLabeller
        .getSuggestions(name, 6)
        .then(function(labels) {
          // 1. sort
          labels = _.sortBy(labels, function(label) {
            return label.name.indexOf(name);
          });
          // 2. add new suggestion
          var suggestedLabels = _.map(_.pluck(suggestedLabels, 'name'), function(label) {
            return label.toUpperCase();
          });
          if (!_.contains(suggestedLabels, name.toUpperCase())) {
            labels.push({name: name});
          }
          // 3. filter already added labels, caseinsensitive
          var alreadyAddedLabels = _.map($scope.cachedLabels, function(label) {
            return label.toUpperCase();
          });
          labels = _.reject(labels, function(label) {
            return alreadyAddedLabels.indexOf(label.name.toUpperCase()) > -1;
          });
          return labels;
        });
    } else {
      return [];
    }
  };

  $scope.onSelect = function($item, $model, $label) {
    var labelName = $label.trim();
    var similarLabel = _.find($scope.cachedLabels, function (existingLabel) {
      return existingLabel.toUpperCase() === labelName.toUpperCase();
    });
    if (!similarLabel) {
      $scope.currentLabel = '';
      select.labelAdded({label: $item});
      $scope.cachedLabels.push($item.name);
    } else {
      $scope.currentLabel = '';
    }
  };

  $scope.onRemove = function ($item) {
    select.labelRemoved({label: $item});
    $scope.cachedLabels = _.without($scope.cachedLabels, $item.name);
  };

}
