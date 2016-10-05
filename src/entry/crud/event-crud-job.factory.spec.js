'use strict';

describe('Factory: Event CRUD Job', function () {
  var EventCrudJob, $scope;

  beforeEach(module('udb.entry'));

  beforeEach(inject(function (_EventCrudJob_, $rootScope) {
    EventCrudJob = _EventCrudJob_;
    $scope = $rootScope.$new();
  }));

  it('should get publish offer description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'publishOffer');
    expect(job.getDescription()).toEqual('Aanbod publiceren: "Offer name".');
  });

  it('should get create event description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'createEvent');
    expect(job.getDescription()).toEqual('Evenement toevoegen: "Offer name".');
  });

  it('should get create place description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'createPlace');
    expect(job.getDescription()).toEqual('Locatie toevoegen: "Offer name".');
  });

  it('should get update offer description description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateDescription');
    expect(job.getDescription()).toEqual('Beschrijving aanpassen: "Offer name".');
  });

  it('should get update typical age-range description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateTypicalAgeRange');
    expect(job.getDescription()).toEqual('Leeftijd aanpassen: "Offer name".');
  });

  it('should get update organizer description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateOrganizer');
    expect(job.getDescription()).toEqual('Organisator aanpassen: "Offer name".');
  });

  it('should get create organizer description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'createOrganizer');
    expect(job.getDescription()).toEqual('Organisatie toevoegen: "Offer name".');
  });

  it('should get delete organizer description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'deleteOrganizer');
    expect(job.getDescription()).toEqual('Organisatie verwijderen: "Offer name".');
  });

  it('should get update contact point description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateContactPoint');
    expect(job.getDescription()).toEqual('Contact informatie aanpassen: "Offer name".');
  });

  it('should get update booking info description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateBookingInfo');
    expect(job.getDescription()).toEqual('Reservatie informatie aanpassen: "Offer name".');
  });

  it('should get update extra info description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateExtraInfo');
    expect(job.getDescription()).toEqual('Extra informatie aanpassen: "Offer name".');
  });

  it('should get update update facilities description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateFacilities');
    expect(job.getDescription()).toEqual('Voorzieningen aanpassen: "Offer name".');
  });

  it('should get add image description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'addImage');
    expect(job.getDescription()).toEqual('Afbeelding toevoegen: "Offer name".');
  });

  it('should get update image description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateImage');
    expect(job.getDescription()).toEqual('Afbeelding aanpassen: "Offer name".');
  });

  it('should get delete image description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'deleteImage');
    expect(job.getDescription()).toEqual('Afbeelding verwijderen: "Offer name".');
  });

  it('should get update major info description', function() {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {name:{nl:"Offer name"}}, 'updateMajorInfo');
    expect(job.getDescription()).toEqual('Hoofdinformatie aanpassen: "Offer name".');
  });

  it('should resolve a task on finish', function(done) {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {apiUrl:"http://blub.be"}, 'updateMajorInfo');

    function expectResolvedTask(apiUrl) {
      expect(apiUrl).toEqual('http://blub.be');
      done();
    }

    job.task.promise.then(expectResolvedTask);
    job.finish();
    $scope.$digest();
  });

  it('should reject a task failure', function(done) {
    var job = new EventCrudJob('01a407a463e25c965a711d234026418f', {apiUrl:"http://blub.be"}, 'updateMajorInfo');

    function expectRejectedTask() {
      expect(job.state).toEqual('failed');
      done();
    }

    job.task.promise.catch(expectRejectedTask);
    job.fail();
    $scope.$digest();
  });
});