describe('Unit : pluginPluginMediaCenterRSS content services', function () {
  describe('Unit: Buildfire Provider', function () {
    var Buildfire;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_Buildfire_) {
      Buildfire = _Buildfire_;
    }));

    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });
  });

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, $rootScope, TAG_NAMES, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('mediaCenterRSSPluginWidget', function ($provide) {
      $provide.service('Buildfire', function () {
        this.datastore = jasmine.createSpyObj('datastore', ['get', 'onUpdate', 'clearListener']);
        this.datastore.get.and.callFake(function (_tagName, callback) {
          if (_tagName) {
            callback(null, 'Success');
          } else {
            callback('Error', null);
          }
        });
        this.datastore.onUpdate.and.callFake(function (callback) {
          callback('Event');
          return {
            clear: function () {
              return true
            }
          }
        });
		this.history = jasmine.createSpyObj('history', ['push', 'pop', 'onPop']);
		this.history.push.and.callFake(function (title, metadata) {
        });
		this.history.pop.and.callFake(function (title, metadata) {
        });
		this.datastore.onPop.and.callFake(function () {
        });
      });
    }));
    beforeEach(inject(function (_$rootScope_, _DataStore_, _Buildfire_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      $rootScope = _$rootScope_;
      DataStore = _DataStore_;
      Buildfire = _Buildfire_;
      TAG_NAMES = _TAG_NAMES_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
    }));

    it('DataStore should exist and be an object', function () {
      expect(typeof DataStore).toEqual('object');
    });
    it('DataStore.get should exist and be a function', function () {
      expect(typeof DataStore.get).toEqual('function');
    });
    it('DataStore.onUpdate should exist and be a function', function () {
      expect(typeof DataStore.onUpdate).toEqual('function');
    });
    it('DataStore.clearListener should exist and be a function', function () {
      expect(typeof DataStore.clearListener).toEqual('function');
    });

    it('DataStore.get should return error', function () {
      var result = ''
        , success = function (response) {
          result = response;
        }
        , error = function (err) {
          result = err;
        };
      DataStore.get(null).then(success, error);
      $rootScope.$digest();
      expect(result).toEqual('Error');
    });

    it('DataStore.get should return success', function () {
      var result = ''
        , success = function (response) {
          result = response;
        }
        , error = function (err) {
          result = err;
        };
      DataStore.get(TAG_NAMES.RSS_FEED_INFO).then(success, error);
      $rootScope.$digest();
      expect(result).toEqual('Success');
    });

    it('DataStore.onUpdate should called', function () {
      DataStore.onUpdate();
      DataStore.clearListener();
      $rootScope.$digest();
      expect(Buildfire.datastore.onUpdate).toHaveBeenCalled();
    });
  });

  describe('Unit : FeedParseService Factory', function () {
    var STATUS_MESSAGES, STATUS_CODE, $httpBackend, q, FeedParseService, $rootScope;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_FeedParseService_, _$rootScope_, _$q_, _$httpBackend_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      FeedParseService = _FeedParseService_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
    }));
    it('FeedParseService should exist and be an object', function () {
      expect(typeof FeedParseService).toEqual('object');
    });
    it('FeedParseService.getFeedData should exist and be a function', function () {
      expect(typeof FeedParseService.getFeedData).toEqual('function');
    });
    describe('Unit : FeedParseService.getFeedData Success', function () {
      beforeEach(function () {
        $httpBackend.expectPOST("http://proxy.buildfire.com/parsefeedurl").respond({
          data: {
            meta: {},
            items: []
          },
          status: 200
        });
      });
      it('FeedParseService.getFeedData should return success', function () {
        var url = 'http://feeds.reuters.com/reuters/USVideoBreakingviews'
          , result = ''
          , success = function (response) {
            result = response;
          }
          , error = function (err) {
            console.log('Error: ', err);
            result = err;
          };
        FeedParseService.getFeedData(url).then(success, error);
        $httpBackend.flush();
        $rootScope.$digest();
        expect(result).toEqual({
          data: {
            meta: {},
            items: []
          }, status: 200
        });
      });
    });
    describe('Unit : FeedParseService.getFeedData Error when Undefined feed url provided', function () {
      beforeEach(function () {
        $httpBackend.expectPOST("http://proxy.buildfire.com/parsefeedurl").respond({
          data: {
            meta: {},
            items: []
          },
          status: 200
        });
      });
      it('FeedParseService.getFeedData should return error "Undefined feed url"', function () {
        var url = ''
          , result = ''
          , success = function (response) {
            result = response;
          }
          , error = function (err) {
            console.log('FeedParseService.getFeedData Error: ', err);
            result = err.message;
          };
        FeedParseService.getFeedData(url).then(success, error);
        $httpBackend.flush();
        $rootScope.$digest();
        expect(result).toEqual('Undefined feed url');
      });
    });
    describe('Unit : FeedParseService.getFeedData Server Error', function () {
      beforeEach(function () {
        $httpBackend.expectPOST("http://proxy.buildfire.com/parsefeedurl").respond(500, 'internal server error');
      });
      it('FeedParseService.getFeedData should return server error', function () {
        var url = 'http://feeds.reuters.com/reuters/USVideoBreakingviews'
          , result = ''
          , success = function (response) {
            result = response;
          }
          , error = function (err) {
            console.log('FeedParseService.getFeedData Error: ', err);
            result = err;
          };
        FeedParseService.getFeedData(url).then(success, error);
        $httpBackend.flush();
        $rootScope.$digest();
        expect(result).toEqual('internal server error');
      });
    });
  });

  describe('Unit : Location Factory', function () {
    var Location, $location, $rootScope;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_$rootScope_, _$window_, _Location_) {
      Location = _Location_;
      $rootScope = _$rootScope_;
      $window = _$window_;
    }));
    describe('Units should be defined', function () {
      it('Location should exist and be an object', function () {
        expect(typeof Location).toEqual('object');
      });
      it('Location.goTo should exist and be a function', function () {
        expect(typeof Location.goTo).toEqual('function');
      });
      it('Location.goTo should exist and be a function', function () {
        Location.goTo('#/item');
        $rootScope.$digest();
        expect($window.location.hash).toEqual('#/item');
      });
    });
  });
  describe('Unit: Underscore Factory', function () {
    var Underscore;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_Underscore_) {
      Underscore = _Underscore_;
    }));

    it('Underscore should exist and be an object', function () {
      expect(typeof Underscore).toEqual('function');
    });
  });
  describe('Unit: ItemDetailsService Factory', function () {
    var ItemDetailsService, $rootScope;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_ItemDetailsService_, _$rootScope_) {
      ItemDetailsService = _ItemDetailsService_;
      $rootScope = _$rootScope_;
    }));

    it('ItemDetailsService should exist and be an object', function () {
      expect(typeof ItemDetailsService).toEqual('object');
    });
    it('ItemDetailsService.getData should exist and be an function', function () {
      expect(typeof ItemDetailsService.getData).toEqual('function');
    });
    it('ItemDetailsService.setData should exist and be an function', function () {
      expect(typeof ItemDetailsService.setData).toEqual('function');
    });
    it('ItemDetailsService.setData should set new value and ItemDetailsService.getData should get value ', function () {
      var data = null;
      ItemDetailsService.setData({name: "sandeep kumar"});
      data = ItemDetailsService.getData();
      expect(data).toEqual({name: "sandeep kumar"});
    });
  });

});

