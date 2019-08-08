describe('Service: Search Helper', function () {

  var searchHelper, queryBuilder;

  // load the service's module
  beforeEach(module('udb.search', function ($provide) {
    queryBuilder = jasmine.createSpyObj('LuceneQueryBuilder', ['createQuery', 'unparseGroupedTree', 'isValid']);
    queryBuilder.createQuery.and.returnValue({ queryString: ''});

    $provide.value('LuceneQueryBuilder', queryBuilder);
  }));

  beforeEach(inject(function (_searchHelper_) {
    searchHelper = _searchHelper_;
  }));

  function getQueryTree() {
    return {
      autumnLeafs: [
        'red',
        'green',
        'yellow'
      ]
    };
  }

  it('should update the active query and query string when setting a new query tree', function () {
    var tree = getQueryTree();
    queryBuilder.unparseGroupedTree.and.returnValue('some:query');
    queryBuilder.createQuery.and.returnValue({ queryString: 'some:query'});

    searchHelper.setQueryTree(tree);
    expect(searchHelper.getQueryTree()).toEqual(tree);
    expect(searchHelper.getQuery()).toEqual({ queryString: 'some:query'});
  });

  it('should clear the query tree when changing the query string directly', function () {
    var tree = getQueryTree();
    queryBuilder.unparseGroupedTree.and.returnValue('some:query');
    queryBuilder.createQuery.and.returnValue({ queryString: 'some:query'});

    searchHelper.setQueryTree(tree);
    expect(searchHelper.getQueryTree()).toEqual(tree);

    searchHelper.setQueryString('genre:"wood-like"');
    expect(searchHelper.getQueryTree()).toEqual(null);
  });

  it('should only rebuild and validate the query when a new query string gets set', function () {
    queryBuilder.createQuery.calls.reset();
    queryBuilder.createQuery.and.returnValue({ queryString: 'genre:"wood-like"'});

    searchHelper.setQueryString('genre:"wood-like"');
    expect(searchHelper.getQuery()).toEqual({ queryString: 'genre:"wood-like"'});

    searchHelper.setQueryString('genre:"wood-like"');
    expect(queryBuilder.createQuery.calls.count()).toEqual(1);
    expect(queryBuilder.isValid.calls.count()).toEqual(1);
  });

  it('can be asked to clear the query tree', function () {
    var tree = getQueryTree();

    searchHelper.setQueryTree(tree);
    expect(searchHelper.getQueryTree()).toEqual(tree);

    searchHelper.clearQueryTree();
    expect(searchHelper.getQueryTree()).toBeNull();
  });
});
