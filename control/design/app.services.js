'use strict';

(function (angular, buildfire) {
  angular.module('mediaCenterRSSPluginDesign')

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
      return {
        get: function (_tagName) {
          var deferred = $q.defer()
            , callback = function (err, result) {
              if (err) {
                return deferred.reject(err);
              } else if (result) {
                return deferred.resolve(result);
              }
            };
          Buildfire.datastore.get(_tagName, callback);
          return deferred.promise;
        },
        save: function (_item, _tagName) {
          var deferred = $q.defer()
            , callback = function (err, result) {
              if (err) {
                return deferred.reject(err);
              } else if (result) {
                return deferred.resolve(result);
              }
            };
          if (!_item) {
            deferred.reject(new Error({
              code: STATUS_CODE.UNDEFINED_DATA,
              message: STATUS_MESSAGES.UNDEFINED_DATA
            }));
          }
          Buildfire.datastore.save(_item, _tagName, callback);
          return deferred.promise;
        }
      };
    }])

  /**
   * A factory which is a wrapper on buildfire.imageLib component defined in buildfire.js.
   */
    .factory("ImageLibrary", ['Buildfire', '$q', 'STATUS_CODE', 'STATUS_MESSAGES', function (Buildfire, $q, STATUS_CODE, STATUS_MESSAGES) {
      return {
        showDialog: function (_options) {
          var deferred = $q.defer()
            , callback = function (err, result) {
              if (err) {
                return deferred.reject(err);
              }
              else if (result) {
                return deferred.resolve(result);
              }
            };
          if (!_options) {
            deferred.reject(new Error({
              code: STATUS_CODE.UNDEFINED_OPTIONS,
              message: STATUS_MESSAGES.UNDEFINED_OPTIONS
            }));
          }
          Buildfire.imageLib.showDialog(_options, callback);
          return deferred.promise;
        }
      };
    }]);
})(window.angular, window.buildfire);