'use strict';

describe('Service: Organizers', function () {
  var udbOrganizers, udbApi, udbUitpasApi, $q;

  beforeEach(module('udb.core', function ($provide) {
    udbApi = jasmine.createSpyObj('udbApi', ['findOrganisations']);
    udbApi.mainLanguage = 'nl';

    udbUitpasApi = jasmine.createSpyObj('udbUitpasApi', ['findOrganisationsCardSystems']);

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });

    $provide.provider('udbUitpasApi', {
      $get: function () {
        return udbUitpasApi;
      }
    });
  }));

  beforeEach(inject(function (_udbOrganizers_, _$q_) {
    udbOrganizers = _udbOrganizers_;
    $q = _$q_;
  }));

  it('should find organizers based on a given name', function () {
    var name = 'test';

    function assertOrganizerSuggestions() {
      expect(udbApi.findOrganisations).toHaveBeenCalledWith(0, 10, null, name);
    }

    udbApi.findOrganisations.and.returnValue($q.resolve());

    udbOrganizers
      .suggestOrganizers(name)
      .then(assertOrganizerSuggestions);
  });

  it('should find organizers based on a given website', function () {
    var website = 'http://foo.bar';

    function assertOrganizerSuggestions() {
      expect(udbApi.findOrganisations).toHaveBeenCalledWith(0, 10, website, null);
    }

    udbApi.findOrganisations.and.returnValue($q.resolve());

    udbOrganizers
      .findOrganizersWebsite(website)
      .then(assertOrganizerSuggestions);
  });

  it('should find the card systems for a given organizer', function () {
    var organizerId = '217781E3-F644-4243-8D1C-1A55AB8EFA2E';

    function assertOrganizerCardSystems() {
      expect(udbUitpasApi.findOrganisationsCardSystems).toHaveBeenCalledWith(organizerId);
    }

    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve());

    udbOrganizers
      .findOrganizersCardsystem(organizerId)
      .then(assertOrganizerCardSystems);
  });
});