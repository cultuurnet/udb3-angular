'use strict';

/**
 * @ngdoc function
 * @name udb.duplication.component:udbEventDuplicationFooter
 * @description
 * # Event Duplication Footer
 * Footer component for migrating events
 */
angular
  .module('udb.duplication')
  .component('udbEventDuplicationFooter', {
    templateUrl: 'templates/event-duplication-footer.component.html',
    controller: EventDuplicationFooterController,
    controllerAs: 'duplication'
  });

function pickFirstEventArgument(event) {
  return event[1];
}

/* @ngInject */
function EventDuplicationFooterController($rootScope, eventDuplicator, $state, rx) {
  var controller = this;
  var duplicateTimingChanged$ = $rootScope
    .$eventToObservable('duplicateTimingChanged')
    .map(pickFirstEventArgument);
  var createDuplicate$ = rx.createObservableFunction(controller, 'createDuplicate');
  var createDuplicateAsMovie$ = rx.createObservableFunction(controller, 'createDuplicateAsMovie');

  var duplicateFormData$ = duplicateTimingChanged$.startWith(false);

  duplicateFormData$
    .subscribe(function (duplicateFormData) {
      controller.readyForDuplication = !!duplicateFormData;
    });

  createDuplicate$
    .withLatestFrom(duplicateFormData$, function (createDuplicate, duplicateFormData) {
      if (duplicateFormData) {
        showAsyncDuplication();
        eventDuplicator
          .duplicate(duplicateFormData)
          .then(showDuplicate, showAsyncError);
      }
    })
    .subscribe();

  createDuplicateAsMovie$
    .withLatestFrom(duplicateFormData$, function (createDuplicateAsMovie, duplicateFormData) {
      if (duplicateFormData) {
        showAsyncDuplication();
        eventDuplicator
          .duplicate(duplicateFormData)
          .then(showDuplicateAsMovie, showAsyncError);
      }
    })
    .subscribe();

  /**
   * @param {string} duplicateId
   */
  function showDuplicate(duplicateId) {
    $state.go('split.eventEdit', {id: duplicateId});
  }

  /**
   * @param {string} duplicateId
   */
  function showDuplicateAsMovie(duplicateId) {
    $state.go('split.eventEditMovie', {id: duplicateId});
  }

  function showAsyncError() {
    controller.asyncError = true;
    controller.duplicating = false;
  }

  function showAsyncDuplication() {
    controller.asyncError = false;
    controller.duplicating = true;
  }
}
