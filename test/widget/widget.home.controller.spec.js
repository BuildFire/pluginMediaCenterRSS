describe('Unit : pluginPluginMediaCenterRSS widget.home.controller.js', function () {
  var WidgetHome, $scope, $filter, $rootScope, $controller, ItemDetailsService, q, FeedParseService, $timeout, $httpBackend, Location, DataStore, Buildfire, Underscore, TAG_NAMES, MEDIUM_TYPES;

  beforeEach(module('mediaCenterRSSPluginWidget'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$filter_, _FeedParseService_, _ItemDetailsService_, _Location_, _$timeout_, _$httpBackend_, _Buildfire_, _Underscore_, _TAG_NAMES_, _MEDIUM_TYPES_) {
    q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $filter = _$filter_;
    ItemDetailsService = _ItemDetailsService_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    Underscore = _Underscore_;
    Location = _Location_;
    TAG_NAMES = _TAG_NAMES_;
    Buildfire = {
      spinner: {},
      datastore: {
        onRefresh: function () {
          return{
            clear:function(){}
          }
        }
      }
    };
    Buildfire.spinner = jasmine.createSpyObj('Buildfire.spinner', ['show', 'hide']);
    Buildfire.spinner.show.and.callFake(function () {
      console.log('Buildfire.spinner.show have called');
    });
    Buildfire.spinner.hide.and.callFake(function () {
      console.log('Buildfire.spinner.hide have called');
    });
    FeedParseService = {};
    FeedParseService = jasmine.createSpyObj('FeedParseService', ['getFeedData']);
    FeedParseService.getFeedData.and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('Error');
      return deferred.promise;
    });
    DataStore = {};
    DataStore = jasmine.createSpyObj('DataStore', ['get', 'onUpdate', 'clearListener','onRefresh']);
	Buildfire.history = jasmine.createSpyObj('history', ['push', 'pop', 'onPop']);
    ItemDetailsService = {};
    ItemDetailsService = jasmine.createSpyObj('ItemDetailsService', ['getData', 'setData']);
    ItemDetailsService.setData.and.callFake(function (data) {
      console.log('ItemDetailsService.setData called with:', data);
    });
  }));

  describe('Unit : widget.home.controller unit tests when  DataStore.get call success', function () {

    beforeEach(function () {
      DataStore.get.and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve({
          data: {
            "content": {
              "carouselImages": [],
              "description": "<p>&nbsp;<br></p>",
              "rssUrl": "http://feeds.cnevids.com/brand/wired.mrss"
            },
            "design": {
              "itemListLayout": '',
              "itemDetailsLayout": '',
              "itemListBgImage": '',
              "itemDetailsBgImage": ''
            }
          }
        });
        return deferred.promise;
      });
      DataStore.onUpdate.and.callFake(function () {
        var deferred = q.defer();
        deferred.notify({
          tag: TAG_NAMES.RSS_FEED_INFO,
          data: {
            "content": {
              "carouselImages": [],
              "description": "<p>&nbsp;<br></p>",
              "rssUrl": "http://feeds.cnevids.com/brand/wired.mrss"
            },
            "design": {
              "itemListLayout": '',
              "itemDetailsLayout": '',
              "itemListBgImage": '',
              "itemDetailsBgImage": ''
            }
          }
        });
        return deferred.promise;
      });
      WidgetHome = $controller('WidgetHomeCtrl', {
        $q: q,
        $scope: $scope,
        $filter: $filter,
        DataStore: DataStore,
        Buildfire: Buildfire,
        FeedParseService: FeedParseService,
        ItemDetailsService: ItemDetailsService,
        Location: Location,
        TAG_NAMES: TAG_NAMES,
        Underscore: Underscore
      });
    });

    describe('Units Should be defined', function () {
      it('WidgetHome should be defined', function () {
        expect(WidgetHome).toBeDefined();
      });
      it('$scope should be defined', function () {
        expect($scope).toBeDefined();
      });
      it('$filter should be defined', function () {
        expect($filter).toBeDefined();
      });
      it('DataStore should be defined', function () {
        expect(DataStore).toBeDefined();
      });
      it('Buildfire should be defined', function () {
        expect(Buildfire).toBeDefined();
      });
      it('FeedParseService should be defined', function () {
        expect(FeedParseService).toBeDefined();
      });
      it('ItemDetailsService should be defined', function () {
        expect(ItemDetailsService).toBeDefined();
      });
      it('Location should be defined', function () {
        expect(Location).toBeDefined();
      });
      it('TAG_NAMES should be defined', function () {
        expect(TAG_NAMES).toBeDefined();
      });
      it('Underscore should be defined', function () {
        expect(Underscore).toBeDefined();
      });
    });

    describe('Unit: WidgetHome.showDescription function', function () {
      it('WidgetHome.showDescription should return false', function () {
        WidgetHome.data = {description: "<p>&nbsp;<br></p>"};
        var result = WidgetHome.showDescription(WidgetHome.data.description);
        $rootScope.$digest();
        expect(result).toEqual(false);
      });
    });

    describe('Unit: WidgetHome.getTitle function', function () {
      it('WidgetHome.getTitle should return title if it present in item object', function () {
        var item = {title: 'Nike sports white shoes'}
          , result = WidgetHome.getTitle(item);
        $rootScope.$digest();
        expect(result).toEqual('Nike sports white shoes');
      });
      it('WidgetHome.getTitle should return title by extracting substring from summary if title not found', function () {
        var item = {summary: 'Nike sports white shoes'}
          , result = WidgetHome.getTitle(item);
        $rootScope.$digest();
        expect(result).toEqual('Nike sports white shoes');
      });
      it('WidgetHome.getTitle should return title by extracting substring from description if title and summary not found', function () {
        var item = {description: 'Nike sports white shoes'}
          , result = WidgetHome.getTitle(item);
        $rootScope.$digest();
        expect(result).toEqual('Nike sports white shoes');
      });
    });

    describe('Unit: WidgetHome.getItemSummary function', function () {
      it('WidgetHome.getItemSummary should return summary have max length 100 characters', function () {
        var item = {summary: 'Nike sports white shoes. Nike sports white shoes Nike sports white shoes Nike sports white shoes Nike sports white shoes'}
          , result = WidgetHome.getItemSummary(item);
        $rootScope.$digest();
        expect(result).toEqual('Nike sports white shoes. Nike sports white shoes Nike sports white shoes Nike sports white shoes Ni…');
      });
      it('WidgetHome.getItemSummary should return summary by extracting substring from description summary not found', function () {
        var item = {description: 'Nike sports white shoes. Nike sports white shoes Nike sports white shoes Nike sports white shoes Nike sports white shoes'}
          , result = WidgetHome.getItemSummary(item);
        $rootScope.$digest();
        expect(result).toEqual('Nike sports white shoes. Nike sports white shoes Nike sports white shoes Nike sports white shoes Ni…');
      });
      it('WidgetHome.getItemSummary should return empty string', function () {
        var item = {link: 'http://buildfire.com/better-blogger-and-avoid-writing-bad-posts/'}
          , result = WidgetHome.getItemSummary(item);
        $rootScope.$digest();
        expect(result).toEqual('');
      });
    });

    describe('Unit: WidgetHome.getItemPublishDate function', function () {
      it('it should empty string if pubDate not available', function () {
        var _item = {
          title: '<strong>Nike white sports shoes</strong>'
        };
        var result = WidgetHome.getItemPublishDate(_item);
        $rootScope.$digest();
        expect(result).toEqual("");
      });
      it('it should return pubDate', function () {
        var _item = {
          title: '<strong>Nike white sports shoes</strong>',
          pubDate: 1442427730006
        };
        var result = WidgetHome.getItemPublishDate(_item);
        $rootScope.$digest();
        expect(result).toContain('Sep 16, 2015');
      });
    });

    describe('Unit: WidgetHome.goToItem function', function () {
      it('it should call ItemDetailsService.setData', function () {
        WidgetHome.items = [
          {
            title: 'Nike white sports shoes',
            pubDate: 1442427730006
          },
          {
            title: 'Adidas black sports shoes',
            pubDate: 1442427730006
          }];
        WidgetHome.goToItem(1);
        $rootScope.$digest();
        expect(ItemDetailsService.setData).toHaveBeenCalledWith({
          title: 'Adidas black sports shoes',
          pubDate: 1442427730006
        });
      });
    });

    describe('Unit: $scope.$destroy() event test', function () {
      it('it should call DataStore.clearListener', function () {
        DataStore.clearListener.and.callFake(function () {
          console.log('DataStore.clearListener have called');
        });
        $scope.$destroy();
        $rootScope.$digest();
        expect(DataStore.clearListener).toHaveBeenCalled();
      });
    });

    describe('UNIT: getFeedData and getImageUrl private functions', function () {
      it('WidgetHome.rssMetaData should be null', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: null,
            status: 200
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(false);
      });
      it('FeedParseService.getFeedData should return success and image url is an empty string', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
      it('FeedParseService.getFeedData should return success and image url extracted from image object', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006,
                "image": {
                  "url": "https://i.vimeocdn.com/video/525756067_295x166.jpg"
                }
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
      it('FeedParseService.getFeedData should return success and image url extracted from enclosures', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006,
                "enclosures": [{
                  "url": "https://i.vimeocdn.com/video/525756067_295x166.jpg",
                  "type": "image/jpg"
                }]
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
      it('FeedParseService.getFeedData should return success and image url extracted from item["media:thumbnail"]["@"]', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006,
                "media:thumbnail": {
                  "@": {
                    "url": "https://i.vimeocdn.com/video/525756067_295x166.jpg",
                    "type": "image/jpg"
                  }
                }
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
      it('FeedParseService.getFeedData should return success and image url extracted from item["media:group"]["media:content"]["media:thumbnail"]["@"]', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006,
                'media:group': {
                  'media:content': {
                    'media:thumbnail': {
                      '@': {
                        "url": "https://i.vimeocdn.com/video/525756067_295x166.jpg",
                        "type": "image/jpg"
                      }
                    }
                  }
                }
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
      it('FeedParseService.getFeedData should return success and image url extracted from description', function () {
        FeedParseService.getFeedData.and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve({
            data: {
              meta: [],
              items: [{
                title: 'Nike white sports shoes>',
                pubDate: 1442427730006,
                description: 'White sports shoes <img src="https://i.vimeocdn.com/video/525756067_295x166.jpg" available now.'
              }]
            }
          });
          return deferred.promise;
        });
        $rootScope.$digest();
        expect(WidgetHome.isItems).toEqual(true);
      });
    });

  });

  describe('Unit : widget.home.controller unit tests when  DataStore.get call Error', function () {
    beforeEach(function () {
      DataStore.get.and.callFake(function () {
        var deferred = q.defer();
        deferred.reject('Error');
        return deferred.promise;
      });
      DataStore.onUpdate.and.callFake(function () {
        var deferred = q.defer();
        deferred.notify(null);
        return deferred.promise;
      });
      WidgetHome = $controller('WidgetHomeCtrl', {
        $q: q,
        $scope: $scope,
        DataStore: DataStore,
        TAG_NAMES: TAG_NAMES
      });
    });
    it('WidgetHome.data should be null', function () {
      $rootScope.$digest();
      expect(WidgetHome.data).toEqual(null);
    });
  });
});