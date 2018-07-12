'use strict';

describe('Component: offer translate images', function () {
  var $rootScope, $scope, $componentController, $q, uibModal, eventCrud, MediaManager, EventFormData;

  var offer = {
    mediaObject: [
      {
        contentUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
        description: "mega mindy",
        copyrightHolder: "studio 100",
        inLanguage: "nl"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/765398de-cf85-494a-83e1-6d2a8ce36f29.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/765398de-cf85-494a-83e1-6d2a8ce36f29.gif",
        description: "mega mindy fr",
        copyrightHolder: "studio 100",
        inLanguage: "fr"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/43b0af55-9997-4cca-82fb-14f557176ea4.jpeg",
        thumbnailUrl: "https://io.uitdatabank.dev/images/43b0af55-9997-4cca-82fb-14f557176ea4.jpeg",
        description: "engelse afbeelding",
        copyrightHolder: "adsfa",
        inLanguage: "en"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/8c52708c-7ffa-4426-a8e7-08e831337ba1.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/8c52708c-7ffa-4426-a8e7-08e831337ba1.gif",
        description: "mega mindy en",
        copyrightHolder: "studio 100",
        inLanguage: "en"
      }
    ],
    languages: [
      "nl",
      "fr",
      "en",
      "de"
    ],
    completedLanguages: [
      "nl",
      "fr"
    ],
    mainLanguage: "nl",
    name: 'test',
    apiUrl: 'apiUrl',
  };

  var activeLanguages = {
    'nl': {'active': true, 'main': true},
    'fr': {'active': true, 'main': false},
    'en': {'active': true, 'main': false},
    'de': {'active': false, 'main': false}
  };

  beforeEach(module('udb.offer-translate'));

  beforeEach(inject(function (_$componentController_, $injector){
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    $q = $injector.get('$q');
    eventCrud = jasmine.createSpyObj('eventCrud', ['addImage']);
    uibModal = $injector.get('$uibModal');
    MediaManager = jasmine.createSpyObj('MediaManager', ['createImage']);
    EventFormData = $injector.get('EventFormData');
  }));

  function getController() {
    var controller = $componentController('offerTranslateImages',
        {
          $uibModal: uibModal,
          eventCrud: eventCrud,
          MediaManager: MediaManager,
          EventFormData: EventFormData
        },
        {
          offer: offer,
          activeLanguages: activeLanguages
        });

    return controller;
  }

  it('should initialize the controller', function() {
    var controller = getController();

    var expectedMediaObjects = [
      {
        contentUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
        description: "mega mindy",
        copyrightHolder: "studio 100",
        inLanguage: "nl"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/765398de-cf85-494a-83e1-6d2a8ce36f29.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/765398de-cf85-494a-83e1-6d2a8ce36f29.gif",
        description: "mega mindy fr",
        copyrightHolder: "studio 100",
        inLanguage: "fr"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/43b0af55-9997-4cca-82fb-14f557176ea4.jpeg",
        thumbnailUrl: "https://io.uitdatabank.dev/images/43b0af55-9997-4cca-82fb-14f557176ea4.jpeg",
        description: "engelse afbeelding",
        copyrightHolder: "adsfa",
        inLanguage: "en"
      },
      {
        contentUrl: "https://io.uitdatabank.dev/images/8c52708c-7ffa-4426-a8e7-08e831337ba1.gif",
        thumbnailUrl: "https://io.uitdatabank.dev/images/8c52708c-7ffa-4426-a8e7-08e831337ba1.gif",
        description: "mega mindy en",
        copyrightHolder: "studio 100",
        inLanguage: "en"
      }
    ];

    expect(EventFormData.mediaObjects).toEqual(expectedMediaObjects);
    expect(EventFormData.name).toEqual('test');
    expect(EventFormData.apiUrl).toEqual('apiUrl');
    expect(EventFormData.mainLanguage).toEqual('nl');
  });

  it('should open the image upload modal', function () {
    var controller = getController();
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.resolve()
    });

    controller.openUploadImageModal('fr');
    $scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should open the modal to edit an image', function () {
    var controller = getController();
    var dummyImage = {
      contentUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
      thumbnailUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
      description: "mega mindy",
      copyrightHolder: "studio 100",
      inLanguage: "nl"
    };

    spyOn(uibModal, 'open').and.returnValue({
      result: $q.resolve()
    });

    controller.editImage(dummyImage);
    $scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should open the modal to remove an image', function () {
    var controller = getController();
    var dummyImage = {
      contentUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
      thumbnailUrl: "https://io.uitdatabank.dev/images/289f7b18-8b94-45e4-9398-8574e76033e8.gif",
      description: "mega mindy",
      copyrightHolder: "studio 100",
      inLanguage: "nl"
    };

    spyOn(uibModal, 'open').and.returnValue({
      result: $q.resolve()
    });

    controller.removeImage(dummyImage);
    $scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });
});
