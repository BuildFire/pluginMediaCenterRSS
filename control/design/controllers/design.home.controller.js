'use strict';

(function (angular) {
  angular
    .module('mediaCenterRSSPluginDesign')
    .controller('DesignHomeCtrl', ['$scope', 'DataStore', 'ImageLibrary', 'TAG_NAMES', 'LAYOUTS', '$timeout','FEED_IMAGES',
      function ($scope, DataStore, ImageLibrary, TAG_NAMES, LAYOUTS, $timeout,FEED_IMAGES) {
        /*
         * Private variables
         *
         * _data used to specify default values to when user's data doesn't exist.
         * @type {object}
         * @private
         *
         * tmrDelay used to hold the time returned by $timeout
         * @private
         *
         *  */
        var DesignHome = this
          , _data = {
            "content": {
              "carouselImages": [],
              "description": "",
              "rssUrl": "https://blog.ted.com/feed"
            },
            "design": {
              "itemListLayout": LAYOUTS.itemListLayouts[0].name,
              "itemDetailsLayout": LAYOUTS.itemDetailsLayouts[0].name,
              "itemListBgImage": "",
              "itemDetailsBgImage": ""
            }
          }
          , tmrDelay = null;

        DesignHome.FEED_IMAGES = FEED_IMAGES;

        /*
         * DesignHome.layouts is used to list out available item list layouts or item details layouts
         * @type {boolean}
         */
        DesignHome.layouts = LAYOUTS;

        /*
         * DesignHome.data is user's data of design and content sections which used throughout the app.
         * @type {object}
         */
        DesignHome.data = angular.copy(_data);

        /*
         * DesignHome.masterData used to hold previous saved user's data.
         * @type {object}
         */
        DesignHome.masterData = null;

        /* saveData(data, tag) private function
         * It will Call the Datastore.save method to save the data object
         * @param data: data to save in datastore.
         * @param tag: An alias given to saved data
         */
        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
            };
          DataStore.save(newObj, tag).then(success, error);
        };

        /**
         * saveDataWithDelay(newObj) private function
         * It will create an artificial delay so api isn't called on every character entered
         * @param newObj is an updated data object
         */
        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = $timeout(function () {
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.RSS_FEED_INFO);
            }, 500);
          }
        };

        /**
         * init() private function
         * It is used to fetch previously saved user's data
         */
        var init = function () {
          var success = function (result) {
              console.info('Init success result:', result);
              if (Object.keys(result.data).length > 0) {
                DesignHome.data = result.data;
              }
              if (DesignHome.data && !DesignHome.data.design) {
                DesignHome.data.design = {};
              }
              if (DesignHome.data && DesignHome.data.design && !DesignHome.data.design.itemListLayout) {
                DesignHome.data.design.itemListLayout = DesignHome.layouts.itemListLayouts[0].name;
              }
              if (DesignHome.data && DesignHome.data.design && !DesignHome.data.design.itemDetailsLayout) {
                DesignHome.data.design.itemDetailsLayout = DesignHome.layouts.itemDetailsLayouts[0].name;
              }
              if (!DesignHome.data.design.showImages)
              DesignHome.data.design.showImages = FEED_IMAGES.YES;

                updateMasterItem(DesignHome.data);
              if (tmrDelay)clearTimeout(tmrDelay);
          }
            , error = function (err) {
              console.error('Error while getting data', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            };
          DataStore.get(TAG_NAMES.RSS_FEED_INFO).then(success, error);
        };

        /**
         * function updateMasterItem(data)
         * Used to update master data with newly saved user's data object.
         * @param data is an updated data.
         */
        function updateMasterItem(data) {
          DesignHome.masterData = angular.copy(data);
        }

        /**
         * function isUnchanged(data)
         * Used to check master data object and updated data object are same or not
         * @param data
         * @returns {*|boolean}
         */
        function isUnchanged(data) {
          return angular.equals(data, DesignHome.masterData);
        }

        /**
         *  updateMasterItem() function invocation to update master data with default data.
         */
        updateMasterItem(_data);

        /**
         * init() function invocation to fetch previously saved user's data from datastore.
         */
        init();

        /**
         * DesignHome.changeListLayout function will be called when you change the layout for listing items page.
         * @param layout
         */
        DesignHome.changeListLayout = function (layout) {
          DesignHome.data.design.itemListLayout = layout;
        };

        /**
         * DesignHome.changeItemDetailsLayout function will be called when you change the layout for item details page.
         * @param layout
         */
        DesignHome.changeItemDetailsLayout = function (layout) {
          DesignHome.data.design.itemDetailsLayout = layout;
        };

        /**
         * DesignHome.addItemListBackgroundImage function will be called when you add/change a background image for listing items page.
         */
        DesignHome.addItemListBackgroundImage = function () {
          var options = {showIcons: false, multiSelection: false};
          var success = function (result) {
              DesignHome.data.design.itemListBgImage = result.selectedFiles && result.selectedFiles[0] || null;
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              console.error('Error while selecting item list background image from ImageLibrary', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            };
          ImageLibrary.showDialog(options).then(success, error);
        };

        /**
         * DesignHome.removeItemListBackgroundImage function will be called when background image removed for listing items page.
         */
        DesignHome.removeItemListBackgroundImage = function () {
          DesignHome.data.design.itemListBgImage = null;
        };

        /**
         * DesignHome.addItemDetailsBackgroundImage function will be called when you add/change a background image for item details page.
         */
        DesignHome.addItemDetailsBackgroundImage = function () {
          var options = {showIcons: false, multiSelection: false};
          var success = function (result) {
              DesignHome.data.design.itemDetailsBgImage = result.selectedFiles && result.selectedFiles[0] || null;
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              console.error('Error while selecting item list background image from ImageLibrary', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            };
          ImageLibrary.showDialog(options).then(success, error);
        };


        /**
         * DesignHome.removeItemDetailsBackgroundImage function will be called when background image removed for item details page.
         */
        DesignHome.removeItemDetailsBackgroundImage = function () {
          DesignHome.data.design.itemDetailsBgImage = null;
        };

        /**
         * $scope.$watch will Watch for changes in user's data object and trigger the saveDataWithDelay function if data changed
         */
        $scope.$watch(function () {
          return DesignHome.data;
        }, saveDataWithDelay, true);
      }]);
})(window.angular);
