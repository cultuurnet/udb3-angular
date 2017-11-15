'use strict';

describe('Service: Media Manager', function () {
  var mediaManager, $q, CreateImageJob;
  var appConfig = {
    baseUrl: 'http://foo.bar/'
  };
  var jobLogger = jasmine.createSpyObj('jobLogger', ['addJob']);
  var udbApi = jasmine.createSpyObj('udbApi', ['getMedia', 'uploadMedia']);
  var $rootScope;

  beforeEach(module('udb.media', function ($provide) {
    $provide.constant('appConfig', appConfig);
    $provide.provider('jobLogger', {
      $get: function () {
        return jobLogger;
      }
    });
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function($injector){
    mediaManager = $injector.get('MediaManager');
    $q = $injector.get('$q');
    CreateImageJob = $injector.get('CreateImageJob');
    $rootScope = $injector.get('$rootScope');
  }));

  it('should promise a media object when getting an image', function (done) {
    var expectedMediaObject = {
      id: 'some-image-id',
      '@id': 'some-image-id',
      '@type': 'schema:MediaObject',
      contentUrl: 'http://foo.bar',
      thumbnailUrl: 'http://foo.bar',
      description: 'description',
      copyrightHolder: 'Foo Bar'
    };
    var jsonMediaObject = {
      '@id': 'some-image-id',
      '@type': 'schema:MediaObject',
      'contentUrl': 'http://foo.bar',
      'thumbnailUrl': 'http://foo.bar',
      'description': 'description',
      'copyrightHolder': 'Foo Bar'
    };

    function assertMediaObject(mediaObject) {
      expect(mediaObject).toEqual(expectedMediaObject);
      done();
    }

    udbApi.getMedia.and.returnValue($q.resolve(jsonMediaObject));

    mediaManager
      .getImage('some-image-id')
      .then(assertMediaObject);

    $rootScope.$digest();
  });

  it('should log the creation of an image', function (done) {
    var file = {type: 'image/png'},
        description = 'description',
        copyrightHolder = 'Foo Bar';

    function assertJobLogged() {
      expect(jobLogger.addJob).toHaveBeenCalled();
      done();
    }

    udbApi.uploadMedia.and.returnValue($q.resolve({'data': {'commandId': 128}}));

    mediaManager
      .createImage(file, description, copyrightHolder);

    $rootScope.$digest();
    assertJobLogged();
  });

  it('should not try to create a file with an invalid file extension', function (done) {
    var file = {type: 'image/bmp'},
        description = 'description',
        copyrightHolder = 'Foo Bar';

    function assertMediaObject(mediaObject) {
      var expextedMediaObject = {data: {title: 'The uploaded file is not an image.'}};
      expect(mediaObject).toEqual(expextedMediaObject);
      done();
    }

    mediaManager
      .createImage(file, description, copyrightHolder)
      .then(function(){return true}, assertMediaObject);

    $rootScope.$digest();
  });
});
