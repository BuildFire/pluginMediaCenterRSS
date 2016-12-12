describe('Unit : pluginPluginMediaCenterRSS content.home.controller.js', function () {
  var ContentHome, scope, $rootScope, $controller, q, FeedParseService, $timeout, $httpBackend, DataStore, Buildfire, TAG_NAMES, LAYOUTS, STATUS_CODE, STATUS_MESSAGES;
  beforeEach(module('mediaCenterRSSPluginContent'));

  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _$httpBackend_, _FeedParseService_, _$timeout_, _Buildfire_, _TAG_NAMES_, _LAYOUTS_, _STATUS_CODE_, _STATUS_MESSAGES_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    FeedParseService = _FeedParseService_;
    $timeout = _$timeout_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    LAYOUTS = _LAYOUTS_;
    $httpBackend = _$httpBackend_;
    DataStore = {};
    DataStore = jasmine.createSpyObj('DataStore', ['get', 'save']);
    DataStore.get.and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve({
        data: {}
      });
      return deferred.promise;
    });
    Buildfire = {
      spinner: {
        show: function () {
          return true
        },
        hide: function () {
          return true
        }
      },
      components: {
        carousel: {
          editor: {}
        }
      }
    };
    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', '', '']);
    Buildfire.components.carousel.editor.and.callFake(function () {
      return {
        loadItems: function () {
          console.log("egitor.loadItems hasbeen called");
        }
      };
    });
  }));

  describe('Units: DataStore.save returns error', function () {
    beforeEach(function () {
      DataStore.save.and.callFake(function () {
        var deferred = q.defer();
        deferred.reject('Error');
        return deferred.promise;
      });
      ContentHome = $controller('ContentHomeCtrl', {
        $scope: scope,
        Buildfire: Buildfire,
        DataStore: DataStore,
        TAG_NAMES: TAG_NAMES,
        LAYOUTS: LAYOUTS
      });
    });

    it('ContentHome.isNotSaved should be false when timeout called', function () {
      $rootScope.$digest();
      $timeout.flush();
      expect(ContentHome.isNotSaved).toEqual(false);
    });
  });

  describe('Units:  DataStore.save returns success', function () {
    beforeEach(function () {
      DataStore.save.and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve({
          data: {
            "content": {
              "carouselImages": [],
              "description": "<p>&nbsp;<br></p>",
              "rssUrl": "http://feeds.cnevids.com/brand/wired.mrss"
            },
            "design": {
              "itemListLayout": LAYOUTS.itemListLayouts[1].name,
              "itemDetailsLayout": LAYOUTS.itemDetailsLayouts[0].name,
              "itemListBgImage": "",
              "itemDetailsBgImage": ""
            }
          }
        });
        return deferred.promise;
      });
      ContentHome = $controller('ContentHomeCtrl', {
        $scope: scope,
        $q: q,
        Buildfire: Buildfire,
        DataStore: DataStore,
        $timeout: $timeout,
        FeedParseService: FeedParseService,
        STATUS_CODE: STATUS_CODE,
        STATUS_MESSAGES: STATUS_MESSAGES,
        TAG_NAMES: TAG_NAMES,
        LAYOUTS: LAYOUTS
      });
    });

    describe('Units: units should be Defined', function () {
      it('it should pass if ContentHome is defined', function () {
        expect(ContentHome).toBeDefined();
      });
      it('it should pass if Buildfire is defined', function () {
        expect(Buildfire).toBeDefined()
      });
      it('it should pass if FeedParseService is defined', function () {
        expect(FeedParseService).toBeDefined()
      });
      it('it should pass if DataStore is defined', function () {
        expect(DataStore).toBeDefined()
      });
      it('it should pass if TAG_NAMES is defined', function () {
        expect(TAG_NAMES).toBeDefined()
      });
      it('it should pass if STATUS_CODE is defined', function () {
        expect(STATUS_CODE).toBeDefined()
      });
      it('it should pass if STATUS_MESSAGES is defined', function () {
        expect(STATUS_MESSAGES).toBeDefined()
      });
      it('it should pass if LAYOUTS is defined', function () {
        expect(LAYOUTS).toBeDefined()
      });
    });

    describe('Function : ContentHome.clearData ', function () {
      it('ContentHome.clearData  should exist and be a function', function () {
        expect(typeof ContentHome.clearData).toEqual('function');
      });
      it('it should pass if ContentHome.data.content.rssUrl  is equals to "" ', function () {
        ContentHome.data = { content : {}};
        ContentHome.data.content.rssUrl = 'http://feeds.cnevids.com/brand/wired.mrss';
        ContentHome.clearData();
        $rootScope.$digest();
        expect(ContentHome.data.content.rssUrl).toEqual('');
      });
    });

    describe('Function : ContentHome.validateFeedUrl ', function () {
      it(' ContentHome.validateFeedUrl  should exist and be a function', function () {
        expect(typeof ContentHome.clearData).toEqual('function');
      });
      describe('Function : ContentHome.validateFeedUrl Error', function () {
        beforeEach(function () {
          $httpBackend.expectPOST("https://proxy.buildfire.com/validatefeedurl").respond({
            data: {
              isValidFeedUrl: false
            },
            status: 200
          });
        });
        it('ContentHome.validateFeedUrl should return Error', function () {
          ContentHome.rssFeedUrl = 'https://www.google.co.in/';
          ContentHome.isInValidUrl = false;
          ContentHome.validateFeedUrl();
          $httpBackend.flush();
          $rootScope.$digest();
          expect(ContentHome.isInValidUrl).toEqual(true);
          $timeout.flush();
          expect(ContentHome.isInValidUrl).toEqual(false);
        });
      });
      describe('Function : ContentHome.validateFeedUrl success', function () {
        beforeEach(function () {
          $httpBackend.expectPOST("https://proxy.buildfire.com/validatefeedurl").respond({
            data: {
              isValidFeedUrl: true
            },
            status: 200
          });
        });
        it('ContentHome.validateFeedUrl  should return success', function () {
          ContentHome.rssFeedUrl = 'http://feeds.cnevids.com/brand/wired.mrss';
          ContentHome.isValidUrl = false;
          ContentHome.validateFeedUrl();
          $httpBackend.flush();
          $rootScope.$digest();
          expect(ContentHome.isValidUrl).toEqual(true);
          $timeout.flush();
          expect(ContentHome.isValidUrl).toEqual(false);
        });
      });
    });
    describe('Function : ContentHome.editor.onAddItems ', function () {
      it('ContentHome.editor.onAddItems should be called', function () {
        ContentHome.data = { content : {}};
        var items = [{
          action: null,
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        }];
        ContentHome.data.content.carouselImages = [];
        ContentHome.editor.onAddItems(items);
        $rootScope.$digest();
        expect(ContentHome.data.content.carouselImages.length).toEqual(1);
      });
    });
    describe('Function : ContentHome.editor.onDeleteItem ', function () {
      it('ContentHome.editor.onDeleteItem should be called', function () {
        ContentHome.data = { content : {}};
        var item = {
          action: null,
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        };
        ContentHome.data.content.carouselImages = [item];
        ContentHome.editor.onDeleteItem(item, 0);
        $rootScope.$digest();
        expect(ContentHome.data.content.carouselImages.length).toEqual(0);
      });
    });
    describe('Function : ContentHome.editor.onItemChange ', function () {
      it('ContentHome.editor.onItemChange should be called', function () {
        ContentHome.data = { content : {}};
        var item = {
          action: {
            name: 'self'
          },
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        };
        ContentHome.data.content.carouselImages = [{
          action: null,
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        }];
        ContentHome.editor.onItemChange(item, 0);
        $rootScope.$digest();
        expect(ContentHome.data.content.carouselImages[0]).toEqual({
          action: {
            name: 'self'
          },
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        });
      });
    });
    describe('Function : ContentHome.editor.onOrderChange ', function () {
      it('ContentHome.editor.onOrderChange should be called', function () {
        ContentHome.data = { content : {}};
        var item = {
          action: {
            name: 'self'
          },
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164.jpg"
        };
        ContentHome.data.content.carouselImages = [
          {
            action: {
              name: 'self'
            },
            imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164.jpg"
          },
          {
            action: null,
            imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
          }];
        ContentHome.editor.onOrderChange(item, 0, 1);
        $rootScope.$digest();
        expect(ContentHome.data.content.carouselImages[0]).toEqual({
          action: null,
          imageUrl: "https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg"
        });
      });
    });
  });
});