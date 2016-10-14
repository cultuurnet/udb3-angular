'use strict';

angular
  .module('udb.uitpas')
  .component('uitpasOrganisationSuggestion', {
    template:
    '<a>' +
      '<span class="organisation-name" ng-bind="::os.organisation.name"></span> ' +
      '<small ng-if="::os.isUitpas" class="label label-default uitpas-tag">UiTPAS</small>' +
    '</a>',
    controller: OrganisationSuggestionController,
    controllerAs: 'os',
    bindings: {
      organisation: '<'
    }
  });

/* @ngInject */
function OrganisationSuggestionController(UitpasLabels) {
  var os = this;

  os.isUitpas = !_.isEmpty(_.intersection(os.organisation.labels, _.values(UitpasLabels)));
}
