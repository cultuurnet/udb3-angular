'use strict';

describe('Controller: User List', function() {
  var $scope,
    $rootscope,
    $q,
    $controller,
    UserService;

  var pagedUsers = {
    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 50,
    'totalItems': 19,
    'member': getUsers(),
    'firstPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'lastPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'nextPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1'
  };

  function getUsers() {
    return {
      'users': [
        {
          'id': '1',
          'email': 'info@mail.com',
          'nick': 'nickname',
          'roles': [
            'admin',
            'moderator'
          ]
        },
        {
          'id': '2',
          'email': 'info@mail.com',
          'nick': 'nickname',
          'roles': [
            'moderator'
          ]
        },
        {
          'id': '3',
          'email': 'info@mail.com',
          'nick': 'nickname',
          'roles': [
            'admin'
          ]
        }
      ],
      'itemsPerPage': 10,
      'totalItems': 19
    }
  };

  beforeEach(module('udb.manage'));
  beforeEach(module('udb.manage.users'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootscope = $rootScope;
    $scope = $rootScope.$new();
  }));

  beforeEach(function () {
    UserService = jasmine.createSpyObj('UserService', ['find']);
    UserService.find.and.returnValue($q.resolve(getUsers()));
  });

  function getController() {
    return $controller(
      'UsersListController', {
        $scope: $scope,
        $rootScope: $rootscope,
        UserService: UserService
      }
    );
  }

  it('initialise the users list', function() {
    var controller = getController();
    $scope.$digest();

    expect(controller.users).toEqual(getUsers().users);
  });

  it('should catch the emit and find the users', function() {
    var controller = getController();
    spyOn(controller, 'findUsers');
    $rootscope.$emit('userSearchSubmitted', {query: 'asdf'});

    expect(controller.findUsers).toHaveBeenCalledWith('asdf');
  });
});
