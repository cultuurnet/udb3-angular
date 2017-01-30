'use strict';
angular.module('udb.cultuurkuur').component('udbEventCultuurkuurComponent', {
    bindings: {
        event: '=',
        permission: '='
    },
    templateUrl: 'templates/event-cultuurkuur.html',
    controller: EventCultuurKuurComponentController
})

function EventCultuurKuurComponentController() {
    var cm = this;
    cm.previewLink = 'http://www.cultuurkuur.be/agenda/e//' + cm.event.id;
    cm.editLink = 'http://dev.cultuurkuur.be/event/' + cm.event.id + '/edit';
    cm.showCultuurKuur = (cm.event.educationFields.length === 0 || cm.event.educationLevels.length === 0);
}
