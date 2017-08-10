'use strict';

describe('Service: SearchResultViewer', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  // instantiate service
  var SearchResultViewer;
  beforeEach(inject(function (_SearchResultViewer_) {
    SearchResultViewer = _SearchResultViewer_;
  }));

  it('should show the first page when the query changes', function () {
    var viewer = new SearchResultViewer();
    viewer.queryChanged('some new query');
    expect(viewer.currentPage).toBe(1);
  });

  it('should update page size and total events when changing results', function () {
    var viewer = new SearchResultViewer(10);
    var results = {
      itemsPerPage: 30,
      totalItems: 100,
      member: []
    };

    expect(viewer.pageSize).toBe(10);
    expect(viewer.totalItems).toBe(0);

    viewer.setResults(results);

    expect(viewer.pageSize).toBe(30);
    expect(viewer.totalItems).toBe(100);
  });

  it('should not reset the active page on the initial search', function () {
    var viewer = new SearchResultViewer(10, 3);
    expect(viewer.currentPage).toEqual(3);

    viewer.queryChanged('city:leuven');
    expect(viewer.currentPage).toEqual(3);

    // a subsequent search should trigger a page reset
    viewer.queryChanged('city:tienen');
    expect(viewer.currentPage).toEqual(1);
  });

  it('should be able to mark all offers on a page', function () {
    var viewer = new SearchResultViewer(10);
    var results = {
      '@context': {
        'hydra': 'http://www.w3.org/ns/hydra/context.jsonld',
        'udb': 'https://io.uitdatabank.be/contexts/'
      },
      '@type':'hydra:PagedCollection',
      'itemsPerPage':30,
      'totalItems':7,
      'member':[
        {'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/event/35560d45-984c-47f2-b392-f40c2b8f9b45','@type':'udb:Event'},
        {'@id':'http://culudb-silex.dev:8080/place/c17124ac-4f47-4e7d-82c3-9ffb9aa3dbd5','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e69100b8-fb3a-470f-af95-e7d5baf7c469','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/event/afb77a75-dfe9-4bb8-831c-d34a4593ad52','@type':'udb:Event'},
        {'@id':'http://culudb-silex.dev:8080/place/67a2bd40-39fe-4dd8-98a0-ede200d087f8','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e742efc8-183a-42c4-97c9-7f6ccc79fd09','@type':'udb:Place'}
      ]
    };

    viewer.setResults(results);

    expect(viewer.events.length).toBe(7);
    expect(viewer.selectedOffers.length).toBe(0);
    expect(viewer.selectionState.name).toBe('none');

    viewer.selectPageItems();

    expect(viewer.selectedOffers.length).toBe(7);
    expect(viewer.selectionState.name).toBe('all');
  });

  it('should be able to select the query', function () {
    var viewer = new SearchResultViewer(10);
    var results = {
      '@context': {
        'hydra': 'http://www.w3.org/ns/hydra/context.jsonld',
        'udb': 'https://io.uitdatabank.be/contexts/'
      },
      '@type':'hydra:PagedCollection',
      'itemsPerPage':30,
      'totalItems':7,
      'member':[
        {'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/event/35560d45-984c-47f2-b392-f40c2b8f9b45','@type':'udb:Event'},
        {'@id':'http://culudb-silex.dev:8080/place/c17124ac-4f47-4e7d-82c3-9ffb9aa3dbd5','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e69100b8-fb3a-470f-af95-e7d5baf7c469','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/event/afb77a75-dfe9-4bb8-831c-d34a4593ad52','@type':'udb:Event'},
        {'@id':'http://culudb-silex.dev:8080/place/67a2bd40-39fe-4dd8-98a0-ede200d087f8','@type':'udb:Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e742efc8-183a-42c4-97c9-7f6ccc79fd09','@type':'udb:Place'}
      ]
    };

    viewer.setResults(results);

    expect(viewer.events.length).toBe(7);
    expect(viewer.selectedOffers.length).toBe(0);
    expect(viewer.querySelected).toBe(false);
    expect(viewer.selectionState.name).toBe('none');

    viewer.selectQuery();

    expect(viewer.selectedOffers.length).toBe(7);
    expect(viewer.querySelected).toBe(true);
    expect(viewer.selectionState.name).toBe('all');
  });

  it('should be able to select a single offer', function () {
    var viewer = new SearchResultViewer(10);
    var results = {
      '@context':'http://www.w3.org/ns/hydra/context.jsonld',
      '@type':'PagedCollection',
      'itemsPerPage':30,
      'totalItems':7,
      'member':[
        {'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c','@type':'Place'},
        {'@id':'http://culudb-silex.dev:8080/event/35560d45-984c-47f2-b392-f40c2b8f9b45','@type':'Event'},
        {'@id':'http://culudb-silex.dev:8080/place/c17124ac-4f47-4e7d-82c3-9ffb9aa3dbd5','@type':'Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e69100b8-fb3a-470f-af95-e7d5baf7c469','@type':'Place'},
        {'@id':'http://culudb-silex.dev:8080/event/afb77a75-dfe9-4bb8-831c-d34a4593ad52','@type':'Event'},
        {'@id':'http://culudb-silex.dev:8080/place/67a2bd40-39fe-4dd8-98a0-ede200d087f8','@type':'Place'},
        {'@id':'http://culudb-silex.dev:8080/place/e742efc8-183a-42c4-97c9-7f6ccc79fd09','@type':'Place'}
      ]
    };

    viewer.setResults(results);

    expect(viewer.events.length).toBe(7);
    expect(viewer.selectedOffers.length).toBe(0);
    expect(viewer.querySelected).toBe(false);
    expect(viewer.selectionState.name).toBe('none');

    viewer.toggleSelect({'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c'});

    expect(viewer.selectedOffers.length).toBe(1);
    expect(viewer.querySelected).toBe(false);
    expect(viewer.selectionState.name).toBe('some');

    expect(viewer.isOfferSelected({'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c'})).toBe(true);
    expect(viewer.isOfferSelected({'@id':'http://culudb-silex.dev:8080/event/afb77a75-dfe9-4bb8-831c-d34a4593ad52'})).toBe(false);

    viewer.toggleSelect({'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c'});

    expect(viewer.selectedOffers.length).toBe(0);
    expect(viewer.isOfferSelected({'@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c'})).toBe(false);
  });

});
