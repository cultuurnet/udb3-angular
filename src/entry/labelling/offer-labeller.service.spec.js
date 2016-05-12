'use strict';

describe('Service: Offer labeller', function () {

  var logger, udbApi, labeller, $q, UdbPlace, $scope, OfferLabelJob;
  var examplePlaceJson = {
    '@id': "http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702",
    '@context': "/api/1.0/place.jsonld",
    name: {
      "nl": "Villa 99, een art deco pareltje"
    },
    creator: "christophe.vanthuyne@ronse.be",
    created: "2015-06-14T15:22:33+02:00",
    modified: "2015-12-15T14:08:06+01:00",
    publisher: "Invoerders Algemeen ",
    available: "2015-08-03T00:00:00+02:00",
    sameAs: [ ],
    address: {
      addressCountry: "BE",
      addressLocality: "Ronse",
      postalCode: "9600",
      streetAddress: "Engelsenlaan 99"
    },
    bookingInfo: {
      description: "",
      name: "standard price",
      price: 0,
      priceCurrency: "EUR"
    },
    terms: [
      {
        label: "Vlaamse Ardennen",
        domain: "flanderstouristregion",
        id: "reg.365"
      },
      {
        label: "Monument",
        domain: "eventtype",
        id: "0.14.0.0.0"
      },
      {
        label: "9600 Ronse",
        domain: "flandersregion",
        id: "reg.1417"
      }
    ],
    "labels": ['some label']
  };

  beforeEach(module('udb.entry', function($provide){
    logger = jasmine.createSpyObj('jobLogger', ['addJob']);
    udbApi = jasmine.createSpyObj('udbApi', ['getRecentLabels', 'labelOffer']);

    $provide.provider('jobLogger', {
      $get: function () {
        return logger;
      }
    });

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function(_$q_, _UdbPlace_, $rootScope, _OfferLabelJob_) {
    $q = _$q_;
    UdbPlace = _UdbPlace_;
    // the labeller tries to fetch the most recent labels from the API when initializing.
    udbApi.getRecentLabels.and.returnValue($q.resolve([]));
    $scope = $rootScope.$new();
    OfferLabelJob = _OfferLabelJob_;

    var fixedDate = new Date();
    spyOn(window, 'Date').and.returnValue(function() {
      return fixedDate;
    });
  }));

  beforeEach(inject(function (offerLabeller) {
    labeller = offerLabeller;
  }));

  it('should create a job and log it when labelling an offer', function (done) {
    var place = new UdbPlace(examplePlaceJson);
    var expectedJob = new OfferLabelJob('E53F8BAA-A640-419F-9C2A-411B86969608', place, 'awesome');
    udbApi.labelOffer.and.returnValue($q.resolve({
      data: {
        commandId: 'E53F8BAA-A640-419F-9C2A-411B86969608'
      }
    }));

    var jobPromise = labeller.label(place, 'awesome');

    function assertJob(job) {
      expect(place.labels).toContain('awesome');
      expect(job.label).toEqual(expectedJob.label);
      expect(udbApi.labelOffer).toHaveBeenCalledWith(
        new URL('http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702'),
        'awesome'
      );
      expect(logger.addJob).toHaveBeenCalledWith(job);

      done();
    }

    jobPromise.then(assertJob);
    $scope.$digest();
  });
});