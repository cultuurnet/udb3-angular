'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:SaveSearchModalController
 * @description
 * # SaveSearchModalController
 * Controller of the udb.entry
 */
angular
  .module('udb.saved-searches')
  .controller('SaveSearchModalController', SaveSearchModalController);

/* @ngInject */
function SaveSearchModalController($scope, udbApi, $q, $uibModalInstance, $translate) {

  var ok = function (type) {
    var name = $scope.queryName;
    $scope.wasSubmitted = true;

    if (type === 'existing') {
      $uibModalInstance.close({name: name, type: type});
    }

    if (name) {
      $uibModalInstance.close({name: name, type: type});
    }
  };

  var cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  var isTabActive = function (tabId) {
    return tabId === $scope.activeTabId;
  };

  var makeTabActive = function (tabId) {
    $scope.activeTabId = tabId;
  };

  var getSavedSearches = function () {
    return udbApi.getSavedSearches().then(function (data) {
      var withTranslation = data.map(function (savedSearch) {
        var key = 'search.savedSearches.items.' + savedSearch.name.toString();
        var translated = $translate.instant(key);
        if (translated !== key) {
          savedSearch.name = translated;
        }
        return savedSearch;
      });
      return $q.resolve(withTranslation);
    });
  };

  getSavedSearches().then(function (savedSearches) {
    $scope.savedSearches = savedSearches;
  });

  $scope.savedSearches = [];
  $scope.cancel = cancel;
  $scope.ok = ok;
  $scope.isTabActive = isTabActive;
  $scope.makeTabActive = makeTabActive;
  $scope.queryName = '';
  $scope.activeTabId = 'new';
  $scope.wasSubmitted = false;
}
