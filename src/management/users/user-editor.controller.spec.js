'use strict';

describe('Controller: User Editor', function () {
  var $scope,
    $rootScope,
    $q,
    $controller,
    RoleManager,
    UserManager;

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.users'));

  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    UserManager = jasmine.createSpyObj('UserManager', ['get', 'getRoles']);
    RoleManager = jasmine.createSpyObj('RoleManager', ['removeUserFromRole', 'find', 'addUserToRole']);
  }));

  function getEditor($stateParams) {
    return $controller(
      'UserEditorController', {
        UserManager: UserManager,
        RoleManager: RoleManager,
        $stateParams: $stateParams
      }
    );
  }

  function loadEditor(){
    var user = {uuid: 'b1da395f-c1ab-4b97-9dcc-8565b9434d39'},
      userRoles = [
        {uuid: '462ba52c-2fbd-4050-969d-7c9aaba4b984'},
        {uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5'}
      ];

    UserManager.get.and.returnValue($q.resolve(user));
    UserManager.getRoles.and.returnValue($q.resolve(userRoles));

    var editor = getEditor({'id': 'b1da395f-c1ab-4b97-9dcc-8565b9434d39'});
    $scope.$digest();

    return editor;
  }

  it('should load a user and his roles with the id passed by the state params', function () {
    var user = {uuid: 'b1da395f-c1ab-4b97-9dcc-8565b9434d39'},
        userRoles = [
          {uuid: '462ba52c-2fbd-4050-969d-7c9aaba4b984'},
          {uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5'}
        ];

    UserManager.get.and.returnValue($q.resolve(user));
    UserManager.getRoles.and.returnValue($q.resolve(userRoles));

    var editor = getEditor({'id': 'b1da395f-c1ab-4b97-9dcc-8565b9434d39'});

    // Make sure the user manager is called with the right parameter.
    expect(UserManager.get).toHaveBeenCalledWith('b1da395f-c1ab-4b97-9dcc-8565b9434d39');
    expect(UserManager.getRoles).toHaveBeenCalledWith('b1da395f-c1ab-4b97-9dcc-8565b9434d39');

    // Check if the editor has the right user and roles to show after all promises resolve.
    $scope.$digest();
    expect(editor.user).toEqual(user);
    expect(editor.roles).toEqual(userRoles);
  });

  it('should queue an action when trying to delete a role', function () {
    var editor = loadEditor();
    spyOn(editor, 'queueAction');

    editor.deleteRole({
      uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
      name: 'godmode',
      constraint: '*:*'
    });

    expect(editor.queueAction).toHaveBeenCalled();
  });

  it('should queue an action when trying to add a role', function () {
    var editor = loadEditor();
    spyOn(editor, 'queueAction');

    editor.addRole({
      uuid: '5cd34cbd-8af7-4d64-97bb-5fe4204ed049',
      name: 'godmode',
      constraint: '*:*'
    });

    expect(editor.queueAction).toHaveBeenCalled();
  });

  it('should not queue an action when trying to add a duplicate role', function () {
    var editor = loadEditor();
    spyOn(editor, 'queueAction');

    editor.addRole({
      uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
      name: 'godmode',
      constraint: '*:*'
    });

    expect(editor.queueAction).not.toHaveBeenCalled();
  });

  it('should queue a single action per role', function () {
    var editor = loadEditor();
    var action = {
      role: {
        uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
        name: 'godmode',
        constraint: '*:*'
      },
      style: 'list-group-item-danger',
      perform: function () {},
      undo: function () {}
    };

    // Adding an action for the first time should work like expected.
    editor.queueAction(action);
    expect(editor.actions.length).toEqual(1);

    // Trying to add an action for the same role should be avoided.
    editor.queueAction(action);
    expect(editor.actions.length).toEqual(1);
  });

  it('should update the list of actions and undo all of its side effects when calling undo for a role', function (){
    var editor = loadEditor();
    var role = {
      uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
      name: 'godmode',
      constraint: '*:*'
    };
    var action = {
      role: role,
      style: 'list-group-item-danger',
      perform: function () {},
      undo: jasmine.createSpy('undoAction')
    };

    editor.queueAction(action);

    editor.undoAction(role);
    expect(editor.actions.length).toEqual(0);
    expect(action.undo).toHaveBeenCalled();
  });

  it('should not style a role without an action', function () {
    var editor = loadEditor();
    var style = editor.getRoleStyle({
      uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
      name: 'godmode',
      constraint: '*:*'
    });

    expect(style).toEqual(null);
  });

  it('should style a role with an action', function () {
    var editor = loadEditor();
    var role = {
      uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
      name: 'godmode',
      constraint: '*:*'
    };

    var action = {
      role: role,
      style: 'list-group-item-danger',
      perform: function () {},
      undo: function () {}
    };

    editor.queueAction(action);
    var style = editor.getRoleStyle(role);

    expect(style).toEqual('list-group-item-danger');
  });

  it('should perform all queued actions when saving a user', function () {
    var editor = loadEditor();
    var actionOne = {
      role: {
        uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5',
        name: 'godmode',
        constraint: '*:*'
      },
      style: 'list-group-item-danger',
      perform: jasmine.createSpy('performActionOne'),
      undo: function () {}
    };

    var actionTwo = {
      role: {
        uuid: '462ba52c-2fbd-4050-969d-7c9aaba4b984',
        name: 'pleb',
        constraint: 'country:plebistan'
      },
      style: 'list-group-item-danger',
      perform: jasmine.createSpy('performActionTwo'),
      undo: function () {}
    };


    editor.queueAction(actionOne);
    actionOne.perform.and.returnValue($q.resolve());

    editor.queueAction(actionTwo);
    actionTwo.perform.and.returnValue($q.reject());

    editor.save();
    $scope.$digest();

    expect(actionOne.perform).toHaveBeenCalled();
    expect(actionTwo.perform).toHaveBeenCalled();
  });

  it('it should promise a list of suggestions when looking up roles', function (done) {
    var editor = loadEditor();
    var expectedRoleSuggestions = [
      {uuid: 'a4d47ccf-59b1-4926-a421-bfb0a1e32e15'}
    ];
    var pagedRolesPromise = $q.resolve({
      member: [
        {uuid: '462ba52c-2fbd-4050-969d-7c9aaba4b984'},
        {uuid: '9424ebda-6a0c-4fa8-9666-1101152419a5'},
        {uuid: 'a4d47ccf-59b1-4926-a421-bfb0a1e32e15'}
      ]
    });

    function assertSuggestions(roles) {
      expect(roles).toEqual(expectedRoleSuggestions);
      done();
    }

    RoleManager.find.and.returnValue(pagedRolesPromise);

    editor
      .lookupRoles('validatoren')
      .then(assertSuggestions);

    $scope.$digest();
  });
});
