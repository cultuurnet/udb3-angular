'use strict';

describe('Controller: event form step 2', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, EventFormData;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    EventFormData.initCalendar();
    stepController = $controller('EventFormStep2Controller', {
      $scope: scope
    });
  }));
});