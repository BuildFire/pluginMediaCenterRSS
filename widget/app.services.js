'use strict';

(function (angular, buildfire, _) {
  angular.module('mediaCenterRSSPluginWidget')

    /**************************************
     *  providers and factories/services  *
     **************************************/

    /**
     * A provider for retrieving global window.buildfire object defined in buildfire.js.
     */
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire;
      };
      return Buildfire;
    }])

    /**
     * A factory which is a wrapper on global buildfire.datastore object defined in buildfire.js
     */
    .factory("DataStore", ['Buildfire', '$q', 'STATUS_CODE', 'STATUS_MESSAGES', function (Buildfire, $q, STATUS_CODE, STATUS_MESSAGES) {
      var onUpdateListeners = [];
      return {
        get: function (_tagName) {
          var deferred = $q.defer(),
            callback = function (err, result) {
              if (err) {
                return deferred.reject(err);
              } else if (result) {
                if (result && result.data && result.data.content && result.data.content.feeds) {
                  result.data.content.feeds = result.data.content.feeds.map(feed => new Feed(feed));
                }
                return deferred.resolve(result);
              }
            };
          Buildfire.datastore.get(_tagName, callback);
          return deferred.promise;
        },
        onUpdate: function () {
          var deferred = $q.defer(),
            callback = function (event) {
              if (!event) {
                return deferred.notify(new Error({
                  code: STATUS_CODE.UNDEFINED_EVENT,
                  message: STATUS_MESSAGES.UNDEFINED_EVENT
                }), true);
              } else {
                return deferred.notify(event);
              }
            },
            onUpdateFn = Buildfire.datastore.onUpdate(callback);

          onUpdateListeners.push(onUpdateFn);
          return deferred.promise;
        },
        clearListener: function () {
          onUpdateListeners.forEach(function (listner) {
            listner.clear();
          });
          onUpdateListeners = [];
        }
      };
    }])

    /**
     * A REST-ful factory used to retrieve feed data.
     */
    .factory("FeedParseService", ['$q', '$http', function ($q, $http) {
      var getFeedData = function (_feedUrl) {
        var deferred = $q.defer();
        if (!_feedUrl) {
          deferred.reject(new Error('Undefined feed url'));
        }
        $http.post('https://proxy.buildfire.com/parsefeedurl', {
            feedUrl: _feedUrl
          })
          .success(function (response) {
            deferred.resolve(response);
          })
          .error(function (error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };
      return {
        getFeedData: getFeedData
      };
    }])

    /**
     * A factory which is used to change routes
     */
    .factory('Location', [function () {
      var _location = window.location;
      return {
        goTo: function (path) {
          _location.href = path;
        },
        goToHome: function () {
          _location.href = _location.href.substr(0, _location.href.indexOf('#'));
        }
      };
    }])

    /**
     * A factory which is a wrapper on lodash.js library
     */
    .factory('Underscore', [function () {
      return _;
    }])

    /**
     * A factory which is used to hold selected item before going on item details page.
     */
    .factory("ItemDetailsService", function () {
      var itemData = null,
        _getData = function () {
          //You could also return specific attribute of the form data instead
          //of the entire data
          return itemData;
        },
        _setData = function (newData) {
          //You could also set specific attribute of the form data instead
          itemData = newData;
        },
        _share = function (item) {
          console.log(item)
          let link = {};
          link.title = item.title;
          link.description = item.title + ", by " + item.author;
          link.imageUrl = item.image && item.image.url ? item.image.url : null;
          
          link.data = {
            link: item.guid,
          };
          
          buildfire.deeplink.generateUrl(link, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              console.log(result.url);
              var options = {
                subject: link.title,
                text: link.description,
                image: link.imageUrl,
                link: result.url
              };
              buildfire.device.share(options, console.log);
            }
          });
        };
      return {
        getData: _getData,
        setData: _setData,
        share: _share
      };
    });
})(window.angular, window.buildfire, window._);