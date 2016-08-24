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
    udbApi = jasmine.createSpyObj('udbApi', [
      'getRecentLabels',
      'labelOffer',
      'labelQuery',
      'labelOffers',
      'findLabels'
    ]);

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

  it('should search for similar labels when asking for suggestions', function (done) {
    var similarLabels = [
      {name: 'biceps', id:'5AAAEB67-A418-42DD-A202-483D2AA537F5'},
      {name: 'bicycle', id:'5CEE3B87-A208-474C-9301-F1CB997A0871'},
      {name: 'bier', id:'4BA4A0C1-1854-4B62-8E0A-2CB2D09C0058'},
      {name: 'bambi', id:'CECB9FBF-5E60-4495-8C5A-50CF8575ECDA'},
      {name: 'barbie', id:'4457F37F-A9D7-4EA5-83BC-74797F5B6E2A'}
    ];
    function assertSuggestions(labels) {
      expect(udbApi.findLabels).toHaveBeenCalledWith('bi', 5);
      expect(labels).toEqual(similarLabels);
      done();
    }
    udbApi.findLabels.and.returnValue($q.resolve({
      member: similarLabels
    }));

    labeller
      .getSuggestions('bi')
      .then(assertSuggestions);

    $scope.$digest();
  });
});
