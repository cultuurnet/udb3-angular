'use strict';

/**
 * @ngdoc service
 * @name udb.entry.EventCreationJob
 * @description
 * This Is the factory that creates an event creation job.
 */
angular
  .module('udb.entry')
  .factory('EventCrudJob', EventCrudJobFactory);

/* @ngInject */
function EventCrudJobFactory(BaseJob, $q, JobStates) {

  /**
   * @class EventCrudJob
   * @constructor
   * @param {string} commandId
   * @param {EventFormData} item
   * @param {string} action
   */
  var EventCrudJob = function (commandId, item, action) {
    BaseJob.call(this, commandId);
    this.item = item;
    this.action = action;
    this.task = $q.defer();
  };

  EventCrudJob.prototype = Object.create(BaseJob.prototype);
  EventCrudJob.prototype.constructor = EventCrudJob;

  EventCrudJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);
    this.task.resolve(this.item.apiUrl);
  };

  EventCrudJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);
    this.task.reject();
  };

  EventCrudJob.prototype.getDescription = function() {

    switch (this.action) {

      case 'createEvent':
        return 'Evenement toevoegen: "' + this.item.name.nl + '".';

      case 'createPlace':
        return 'Locatie toevoegen: "' + this.item.name.nl + '".';

      case 'updateDescription':
        return 'Beschrijving aanpassen: "' + this.item.name.nl + '".';

      case 'updateTypicalAgeRange':
        return 'Leeftijd aanpassen: "' + this.item.name.nl + '".';

      case 'updateOrganizer':
        return 'Organisator aanpassen: "' + this.item.name.nl + '".';

      case 'createOrganizer':
        return 'Organisatie toevoegen: "' + this.item.name.nl + '".';

      case 'deleteOrganizer':
        return 'Organisatie verwijderen: "' + this.item.name.nl + '".';

      case 'updateContactPoint':
        return 'Contact informatie aanpassen: "' + this.item.name.nl + '".';

      case 'updateBookingInfo':
        return 'Reservatie informatie aanpassen: "' + this.item.name.nl + '".';

      case 'updateExtraInfo':
        return 'Extra informatie aanpassen: "' + this.item.name.nl + '".';

      case 'updateFacilities':
        return 'Voorzieningen aanpassen: "' + this.item.name.nl + '".';

      case 'addImage':
        return 'Afbeelding toevoegen: "' + this.item.name.nl + '".';

      case 'updateImage':
        return 'Afbeelding aanpassen: "' + this.item.name.nl + '".';

      case 'deleteImage':
        return 'Afbeelding verwijderen: "' + this.item.name.nl + '".';

      case 'updateMajorInfo':
        return 'Hoofdinformatie aanpassen: "' +  this.item.name.nl + '".';

      case 'updatePriceInfo':
        return 'Prijsinformatie aanpassen: "' + this.item.name.nl + '".';

      case 'publishOffer':
        return 'Aanbod publiceren: "' + this.item.name.nl + '".';

    }

  };

  return (EventCrudJob);
}
