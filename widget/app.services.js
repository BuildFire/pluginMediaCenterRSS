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

    /*
     * A factory which is used to track analytics actions
     */
    .factory('trackAnalyticsActions', ['MEDIUM_TYPES', function (MEDIUM_TYPES) {
      let analyticsTrackingInterval = null;
      let lastAnalyticsTime = null;
      let openedItems = [];
      let playedItems = [];

      function trackPlayedItem(options) {
        const { item, itemType } = options;

        const metaData = {
          itemId: item.guid,
          itemTitle: item.title,
          imageUrl: item.imageSrcUrl,
        };

        if (!playedItems.includes(item.guid)) {
          playedItems.push(item.guid);
          AnalyticsManager.trackEvent(`${item.guid}_playsCount`, metaData);
          if (itemType === 'video') {
            AnalyticsManager.trackEvent(`videoPlaysCount`, metaData);
          } else {
            AnalyticsManager.trackEvent(`audioPlaysCount`, metaData);
          }
        }
      }

      function trackOpenedItem(item) {
        if (!openedItems.includes(item.guid)) {
          openedItems.push(item.guid);
          const metaData = {
            itemId: item.guid,
            itemTitle: item.title,
            imageUrl: item.imageSrcUrl,
          };
          AnalyticsManager.trackEvent(`${item.guid}_opensCount`, metaData);
          switch (item.type) {
            case MEDIUM_TYPES.VIDEO:
              AnalyticsManager.trackEvent('videoOpensCount', metaData);
              break;
            case MEDIUM_TYPES.AUDIO:
              AnalyticsManager.trackEvent('audioOpensCount', metaData);
              break;
            default:
              AnalyticsManager.trackEvent('articleOpensCount', metaData);
              break;
          }
        }
      }

      function trackItemWatchState(options) {
        const { state, currentTime, item, itemType } = options;

        const metaData = {
          itemId: item.guid,
          itemTitle: item.title,
          imageUrl: item.imageSrcUrl,
        };
        const eventKey = `${item.guid}_secondsWatch`;
        if (state === 'play') {
          trackPlayedItem({ item, itemType });
          
          if (!analyticsTrackingInterval) {
            analyticsTrackingInterval = setInterval(() => {
              lastAnalyticsTime += 5;
              metaData._buildfire = { aggregationValue: 5 }; // 5 seconds
              AnalyticsManager.trackEvent(eventKey, metaData);
            }, 5 * 1000);
          }
        } else if (state === 'pause') {
          if (analyticsTrackingInterval) {
            clearInterval(analyticsTrackingInterval);
            analyticsTrackingInterval = null;

            const extraTime = parseInt(currentTime - lastAnalyticsTime);
            if (currentTime > 0 && extraTime > 0) {
              lastAnalyticsTime += extraTime;
              metaData._buildfire = { aggregationValue: extraTime };
              AnalyticsManager.trackEvent(eventKey, metaData);
            }
          }
        }
      }

      return {
        trackPlayedItem,
        trackOpenedItem,
        trackItemWatchState
      }
    }])

    .factory('utils', ['$filter' , function ($filter) {
      /**
     * @name getImageUrl()
     * Used to extract image url
     * @param item
     * @returns {*}
     */
      function getImageUrl(item) {
        var i = 0,
          length = 0,
          imageUrl = '';
        if (item.image && item.image.url) {
          imageUrl = item.image.url;
        } else if (item.enclosures && item.enclosures.length > 0) {
          length = item.enclosures.length;
          for (i = 0; i < length; i++) {
            if (item.enclosures[i].type.indexOf('image') === 0 || item.enclosures[i].type.indexOf('img') != -1) {
              imageUrl = item.enclosures[i].url;
              break;
            }
          }
        }
        if (imageUrl) {
          return imageUrl;
        }
        else {
          if (item['media:thumbnail'] && item['media:thumbnail']['@'] && item['media:thumbnail']['@'].url) {
            return item['media:thumbnail']['@'].url;
          } else if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content']['media:thumbnail'] && item['media:group']['media:content']['media:thumbnail']['@'] && item['media:group']['media:content']['media:thumbnail']['@'].url) {
            return item['media:group']['media:content']['media:thumbnail']['@'].url;
          } else if (item.description) {
            return $filter('extractImgSrc')(item.description);
          } else {
            return '';
          }
        }
      }

      return { getImageUrl }
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