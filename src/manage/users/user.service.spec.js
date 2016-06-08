describe('Service: UserService', function () {

  var $q, UserService;

  beforeEach(inject(function (_$q_) {
    $q = _$q_;
    UserService = jasmine.createSpyObj('UserService', ['find']);
  }));

  function getUsers() {
    return [
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
  }

  it('should find the users', function () {
    var users = getUsers();
    UserService.find.and.returnValue(users);

    expect(UserService.find()).toEqual(users);
  });
});
