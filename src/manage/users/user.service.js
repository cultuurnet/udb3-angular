'use strict';

/**
 * @ngdoc service
 * @name udb.manage.user
 * @description
 * # user
 * Service in the udb.manage.
 */
angular
  .module('udb.manage')
  .service('UserService', UserService);

/* @ngInject */
function UserService($q) {
  var service = this;

  var jsonUsers = [
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
    },
    {
      'id': '4',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': [
        'admin'
      ]
    },
    {
      'id': '5',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '6',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': [
        'moderator'
      ]
    },
    {
      'id': '7',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '8',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '9',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '10',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '11',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '12',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '13',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '14',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '15',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '16',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '17',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '18',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    },
    {
      'id': '19',
      'email': 'info@mail.com',
      'nick': 'nickname',
      'roles': []
    }
  ];

  function pageArray(items, itemsPerPage) {
    var result = [];
    angular.forEach(items, function(item, index) {
      var rowIndex = Math.floor(index / itemsPerPage),
          colIndex = index % itemsPerPage;
      if (!result[rowIndex]) {
        result[rowIndex] = [];
        result[rowIndex].users = [];
        result[rowIndex].itemsPerPage = itemsPerPage;
        result[rowIndex].totalItems = items.length;
      }

      result[rowIndex].users[colIndex] = item;
    });

    return result;
  }

  service.find = function(query, page) {
    var deferredUsers = $q.defer();

    var usersArray;
    if (query) {
      usersArray = _.shuffle(jsonUsers);
    }
    else {
      usersArray = jsonUsers;
    }
    usersArray = pageArray(usersArray, 10);

    deferredUsers.resolve(usersArray[page - 1]);
    return deferredUsers.promise;
  };
}
