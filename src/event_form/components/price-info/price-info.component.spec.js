'use strict';

describe('Component: price info', function () {
  var $componentController, $rootScope, $scope, eventCrud, udbUitpasApi, $q, UdbOrganizer, uibModal;
  var appConfig = {
    uitpasUrl: 'http://foo.bar/',
  };

  function getOrganizerObject(isUitPas) {
    return new UdbOrganizer({
      '@id': 'http/du.de/organisation/357D5297-9E37-1DE9-62398987EA110D38',
      'name': 'Club Silo',
      'addresses': [
        {
          addressCountry: 'BE',
          addressLocality: 'Leuven',
          postalCode: '3000',
          streetAddress: 'Vaartkom 39'
        }
      ],
      'email': [
        'info@silo.be'
      ],
      'phone': [
        '+32 476 838982'
      ],
      'url': [],
      'labels': [
        'green',
        'UiTPAS'
      ],
      'isUitpas': isUitPas || true
    });
  }

  function getController(isUitPas) {
    var controller = $componentController('priceInfo',
    {
      $scope: $scope,
      $rootScope: $rootScope,
      $uibModal: uibModal,
    },
    {
      organizer: getOrganizerObject(isUitPas),
      eventId: '1234'
    });

    controller.$onInit();

    return controller;
  }

  beforeEach(module('udb.event-form', function($provide) {
    $provide.constant('appConfig', appConfig);

    $provide.provider('udbUitpasApi', {
      $get: function () {
        return udbUitpasApi;
      }
    });

    $provide.provider('eventCrud', {
      $get: function () {
        return eventCrud;
      }
    });
  }));

  beforeEach(inject(function ($injector){
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $componentController = $injector.get('$componentController');
    UdbOrganizer = $injector.get('UdbOrganizer');
    $q = $injector.get('$q');
    uibModal = $injector.get('$uibModal');
    eventCrud = jasmine.createSpyObj('eventCrud', [
      'updatePriceInfo'
    ]);
    udbUitpasApi = jasmine.createSpyObj('udbUitpasApi', ['getTicketSales']);
  }));

   it('should open the price modal when there is no price-info yet and therefore no ticketsales', function() {
       var controller = getController();

       spyOn(uibModal, 'open').and.returnValue({
         result: $q.resolve()
       });
       eventCrud.updatePriceInfo.and.returnValue($q.resolve());

       controller.changePrice();
       $scope.$apply();

       expect(uibModal.open).toHaveBeenCalled();
   });

  it('should not open the price edit modal when tickets have been sold', function() {
      var controller = getController();
      controller.price = [
        {
          category: 'base',
          name: 'Basistarief',
          priceCurrency: 'EUR',
          price: 4.00
        }
      ];

      udbUitpasApi.getTicketSales.and.returnValue($q.resolve(true));

      controller.changePrice();
      $scope.$apply();

      expect(udbUitpasApi.getTicketSales).toHaveBeenCalled();
      expect(controller.hasTicketSales).toBeTruthy();
  });

  it('should open the price edit modal when no tickets have been sold', function() {
      var controller = getController();
      controller.price = [
        {
          category: 'base',
          name: 'Basistarief',
          priceCurrency: 'EUR',
          price: 4.00
        }
      ];

      spyOn(uibModal, 'open').and.returnValue({
        result: $q.resolve()
      });
      udbUitpasApi.getTicketSales.and.returnValue($q.resolve(false));
      eventCrud.updatePriceInfo.and.returnValue($q.resolve());

      controller.changePrice();
      $scope.$apply();

      expect(udbUitpasApi.getTicketSales).toHaveBeenCalled();
      expect(uibModal.open).toHaveBeenCalled();
      expect(eventCrud.updatePriceInfo).toHaveBeenCalled();
  });

  it('should throw an error when UiTPAS service rejects the request', function() {
      var controller = getController();
      controller.price = [
        {
          category: 'base',
          name: 'Basistarief',
          priceCurrency: 'EUR',
          price: 4.00
        }
      ];

      udbUitpasApi.getTicketSales.and.returnValue($q.reject());

      controller.changePrice();
      $scope.$apply();

      expect(controller.hasUitpasError).toBeTruthy();
  });
});
