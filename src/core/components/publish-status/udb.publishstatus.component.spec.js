'use strict';

describe('Publish-status Component', function () {
  var $componentController;
  var $translate;

  beforeEach(module('udb.core'));

  beforeEach(inject(function ($injector) {
    $componentController = $injector.get('$componentController');
    $translate = {
        instant : function(code){
            if(code === 'publicationStatus.DRAFT' || code === 'publicationStatus.REJECTED' || code === 'publicationStatus.DELETED') {
                return 'Niet gepubliceerd';
            } else if ( code === 'publicationStatus.READY_FOR_VALIDATION' || code === 'publicationStatus.APPROVED'){
                return 'Gepubliceerd';
            }
        }
    };

  }));

  function getComponentController(event,permission) {
    var bindings = {
      status : status
    };

    return $componentController('udbPublishStatusComponent', {
        $translate: $translate
    }, bindings);
  }

  it('should return "Niet gepubliceerd" when status is DRAFT', function () {
    status = 'DRAFT';
    var controller = getComponentController(status);
    expect(controller.statusTranslated).toEqual('Niet gepubliceerd');
  });

  it('should return "Niet gepubliceerd" when status is REJECTED', function () {
    status = 'REJECTED';
    var controller = getComponentController(status);
    expect(controller.statusTranslated).toEqual('Niet gepubliceerd');
  });

  it('should return "Niet gepubliceerd" when status is DELETED', function () {
    status = 'DELETED';
    var controller = getComponentController(status);
    expect(controller.statusTranslated).toEqual('Niet gepubliceerd');
  });

  it('should return "Gepubliceerd" when status is READY_FOR_VALIDATION', function () {
    status = 'READY_FOR_VALIDATION';
    var controller = getComponentController(status);
    expect(controller.statusTranslated).toEqual('Gepubliceerd');
  });

  it('should return "Gepubliceerd" when status is APPROVED', function () {
    status = 'APPROVED';
    var controller = getComponentController(status);
    expect(controller.statusTranslated).toEqual('Gepubliceerd');
  });

});
