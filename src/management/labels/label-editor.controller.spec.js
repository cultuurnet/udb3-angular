'use strict';

describe('Controller: Labels Editor', function() {
  var
    LabelManager,
    $q,
    $rootScope,
    $scope,
    $controller,
    $stateParams;

  var id = "1d470df5-75c8-4a93-a70e-61c383263738";
  var label = {
    "id":"1d470df5-75c8-4a93-a70e-61c383263738",
    "name":"Blub",
    "visibility":"visible",
    "privacy":"public"
  };

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.labels'));

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    LabelManager = jasmine.createSpyObj('LabelManager', [
      'makeVisible',
      'makeInvisible',
      'makePrivate',
      'makePublic',
      'get',
      'copy'
    ]);
  }));

  function getController() {
    return $controller(
      'LabelEditorController', {
        LabelManager: LabelManager,
        $scope: $scope,
        $stateParams: $stateParams
      }
    );
  }

  it('should load a label', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(LabelManager.get).toHaveBeenCalledWith(id);
    expect(editor.label).toEqual(label);
  });

  it('should set a label as visible', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(editor.label.isVisible).toEqual(true);
  });

  it('should set a label as invisible', function() {
    var invisibleLabel = {
      "id":"1d470df5-75c8-4a93-a70e-61c383263738",
      "name":"Blub",
      "visibility":"invisible",
      "privacy":"public"
    };
    LabelManager.get.and.returnValue($q.resolve(invisibleLabel));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(editor.label.isVisible).toEqual(false);
  });

  it('should set a label as public', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(editor.label.isPrivate).toEqual(false);
  });

  it('should set a label as private', function() {
    var privateLabel = {
      "id":"1d470df5-75c8-4a93-a70e-61c383263738",
      "name":"Blub",
      "visibility":"invisible",
      "privacy":"private"
    };
    LabelManager.get.and.returnValue($q.resolve(privateLabel));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(editor.label.isPrivate).toEqual(true);
  });

  it('should update a label\'s privacy to private', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.isPrivate = true;
    LabelManager.makePrivate.and.returnValue($q.resolve());

    editor.save();

    expect(LabelManager.makePrivate).toHaveBeenCalled();
  });

  it('should update a label\'s privacy to public', function() {
    var privateLabel = {
      "id":"1d470df5-75c8-4a93-a70e-61c383263738",
      "name":"Blub",
      "visibility":"invisible",
      "privacy":"private"
    };
    LabelManager.get.and.returnValue($q.resolve(privateLabel));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.isPrivate = false;
    LabelManager.makePublic.and.returnValue($q.resolve());

    editor.save();

    expect(LabelManager.makePublic).toHaveBeenCalled();
  });

  it('should update a label\'s visibility to invisible', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.isVisible = false;
    LabelManager.makeInvisible.and.returnValue($q.resolve());

    editor.save();

    expect(LabelManager.makeInvisible).toHaveBeenCalled();
  });

  it('should update a label\'s visibility to visible', function() {
    var invisibleLabel = {
      "id":"1d470df5-75c8-4a93-a70e-61c383263738",
      "name":"Blub",
      "visibility":"invisible",
      "privacy":"private"
    };
    LabelManager.get.and.returnValue($q.resolve(invisibleLabel));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.isVisible = true;
    LabelManager.makeVisible.and.returnValue($q.resolve());

    editor.save();

    expect(LabelManager.makeVisible).toHaveBeenCalled();
  });

  it('should rename a label', function() {
    var newLabel = {
      "id":"new-id",
      "name":"Coco",
      "visibility":"visible",
      "privacy":"public"
    };
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.name = 'Coco';
    LabelManager.copy.and.returnValue($q.resolve({labelId:"new-id"}));
    LabelManager.get.and.returnValue($q.resolve(newLabel));

    editor.save();
    $scope.$digest();

    expect(LabelManager.copy).toHaveBeenCalled();
    expect(editor.label).toEqual(newLabel);
  });

  it('should update the saving indicator', function() {
    LabelManager.get.and.returnValue($q.resolve(label));
    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.label.isVisible = false;
    LabelManager.makeInvisible.and.returnValue($q.resolve());

    editor.save();
    $scope.$digest();

    expect(editor.saving).toEqual(false);
  });

  it('should show a loading error', function() {
    LabelManager.get.and.returnValue($q.reject());
    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(editor.loadingError).toEqual('Label niet gevonden!');
  });

});
