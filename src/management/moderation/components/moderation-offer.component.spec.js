'use strict';

describe('Component: Moderation Offer', function () {

  var $rootScope, $scope, $componentController, $q, moderationManager, UdbEvent, $uibModal;

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.moderation'));
  beforeEach(module('udb.templates'));

  var offer = {
    "@id": "http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043",
    "name": {
      "nl": "Nederlands",
      "de": "Deutch",
      "en": "English",
      "fr": "Français"
    },
    "description": {
      "nl": "Nederlands",
      "de": "Deutch",
      "en": "English",
      "fr": "Français"
    },
    "available": "2015-05-07T12:02:53+00:00",
    "image": "http://media.uitdatabank.be/20150416/153cfa0f-0d22-451e-bfd1-490b7c4ef109.jpg",
    "labels": [
      "tagged"
    ],
    "calendarSummary": "Every first day of the month",
    "location": {
      "description": {
        "nl": "Nederlands",
        "de": "Deutch",
        "en": "English",
        "fr": "Français"
      },
      "name": {
        "nl": "Nederlands",
        "de": "Deutch",
        "en": "English",
        "fr": "Français"
      },
      "address": {
        "addressCountry": "BE",
        "addressLocality": "Leuven",
        "postalCode": 3000,
        "streetAddress": "Sluisstraat 79"
      },
      "bookingInfo": {
        "priceCurrency": "EUR",
        "description": "No need to pay anything",
        "name": "Free",
        "price": 0
      },
      "terms": [
        {
          "label": "Cycling",
          "domain": "activities",
          "id": "10.0.0.1"
        }
      ],
      "workflowStatus": "DRAFT"
    },
    "organizer": {
      "name": "STUK",
      "address": {
        "addressCountry": "BE",
        "addressLocality": "Leuven",
        "postalCode": 3000,
        "streetAddress": "Sluisstraat 79"
      },
      "email": "info@stuk.be",
      "phone": [
        "016 320 300"
      ]
    },
    "bookingInfo": {
      "priceCurrency": "EUR",
      "description": "No need to pay anything",
      "name": "Free",
      "price": 0
    },
    "terms": [
      {
        "label": "Cycling",
        "domain": "activities",
        "id": "10.0.0.1"
      }
    ],
    "creator": "evenementen@stad.diksmuide.be",
    "created": "2015-05-07T12:02:53+00:00",
    "modified": "2015-05-07T12:02:53+00:00",
    "publisher": "Invoerders Algemeen ",
    "endDate": "2015-05-07T12:02:53+00:00",
    "startDate": "2015-05-07T12:02:53+00:00",
    "calendarType": "permanent",
    "typicalAgeRange": "+18",
    "performer": [
      {
        "name": "Sindicato Sonico"
      }
    ],
    "sameAs": [
      "http://www.uitinvlaanderen.be/agenda/e/zomerse-vrijdagen-den-engel/0823f57e-a6bd-450a-b4f5-8459b4b11043"
    ],
    "seeAlso": [
      "www.leuven.be"
    ],
    "workflowStatus": "READY_FOR_VALIDATION"
  };

  beforeEach(inject(function (_$rootScope_, $compile, _$componentController_, _$q_, _UdbEvent_){
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    $q = _$q_;
    UdbEvent = _UdbEvent_;

    moderationManager = jasmine.createSpyObj('ModerationManager', [
      'getModerationOffer',
      'approveOffer',
      'rejectOffer',
      'duplicateOffer',
      'inappropriateOffer'
    ]);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
  }));

  function getController() {
    return $componentController(
      'udbModerationOffer',
      {
        'ModerationManager': moderationManager,
        '$uibModal': $uibModal
      },
      {
        offerId: 'http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043',
        offerType: 'Event'
      });
  }

  it('should load the offer info', function () {
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));

    var controller = getController();
    $scope.$digest();

    expect(moderationManager.getModerationOffer).toHaveBeenCalledWith(
      'http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043'
    );
    expect(controller.loading).toEqual(false);
    expect(controller.offer.name).toEqual('Nederlands');
  });

  it('should show an error on loading fail', function () {
    moderationManager.getModerationOffer.and.returnValue($q.reject());

    var controller = getController();
    $scope.$digest();

    expect(moderationManager.getModerationOffer).toHaveBeenCalledWith(
      'http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043'
    );
    expect(controller.loading).toEqual(false);
    expect(controller.error).toEqual('Dit aanbod kon niet geladen worden.');
  });

  it('should determine if an offer is READY_FOR_VALIDATION', function() {
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));

    var controller = getController();
    $scope.$digest();

    expect(controller.isReadyForValidation()).toEqual(true);
    expect(controller.isApproved()).toEqual(false);
    expect(controller.isRejected()).toEqual(false);
  });

  it('should determine if an offer is APPROVED', function() {
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));

    var controller = getController();
    $scope.$digest();

    controller.offer.workflowStatus = 'APPROVED';

    expect(controller.isReadyForValidation()).toEqual(false);
    expect(controller.isApproved()).toEqual(true);
    expect(controller.isRejected()).toEqual(false);
  });

  it('should determine if an offer is REJECTED', function() {
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));

    var controller = getController();
    $scope.$digest();

    controller.offer.workflowStatus = 'REJECTED';

    expect(controller.isReadyForValidation()).toEqual(false);
    expect(controller.isApproved()).toEqual(false);
    expect(controller.isRejected()).toEqual(true);
  });

  it('should approve an offer', function() {
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));
    moderationManager.approveOffer.and.returnValue($q.resolve());

    var controller = getController();
    $scope.$digest();

    expect(controller.offer.workflowStatus).toEqual('READY_FOR_VALIDATION');

    controller.approve();
    $scope.$digest();

    expect(moderationManager.approveOffer).toHaveBeenCalled();
    expect(controller.offer.workflowStatus).toEqual('APPROVED');
    expect(controller.sendingJob).toEqual(false);
  });

  it('should ask for rejection reasons before rejecting', function() {
    $uibModal.open.and.returnValue({ result: $q.resolve('Mijn reden.') });
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));
    moderationManager.rejectOffer.and.returnValue($q.resolve());

    var controller = getController();
    $scope.$digest();

    controller.askForRejectionReasons();
    $scope.$digest();

    expect(moderationManager.rejectOffer).toHaveBeenCalled();
    expect(controller.offer.workflowStatus).toEqual('REJECTED');
    expect(controller.sendingJob).toEqual(false);
    expect(controller.error).toEqual(false);
  });

  it('should mark as duplicate offer', function() {
    $uibModal.open.and.returnValue({ result: $q.resolve('DUPLICATE') });
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));
    moderationManager.duplicateOffer.and.returnValue($q.resolve());

    var controller = getController();
    $scope.$digest();

    controller.askForRejectionReasons();
    $scope.$digest();

    expect(moderationManager.duplicateOffer).toHaveBeenCalled();
    expect(controller.offer.workflowStatus).toEqual('REJECTED');
    expect(controller.sendingJob).toEqual(false);
    expect(controller.error).toEqual(false);
  });

  it('should mark as inappropriate offer', function() {
    $uibModal.open.and.returnValue({ result: $q.resolve('INAPPROPRIATE') });
    moderationManager.getModerationOffer.and.returnValue($q.resolve(new UdbEvent(offer)));
    moderationManager.inappropriateOffer.and.returnValue($q.resolve());

    var controller = getController();
    $scope.$digest();

    controller.askForRejectionReasons();
    $scope.$digest();

    expect(moderationManager.inappropriateOffer).toHaveBeenCalled();
    expect(controller.offer.workflowStatus).toEqual('REJECTED');
    expect(controller.sendingJob).toEqual(false);
    expect(controller.error).toEqual(false);
  });
});