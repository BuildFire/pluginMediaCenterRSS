'use strict';

(function (angular) {
  angular
    .module('mediaCenterRSSPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'DataStore', 'Buildfire', 'TAG_NAMES', 'LAYOUTS', 'FeedParseService', '$timeout',
      function ($scope, DataStore, Buildfire, TAG_NAMES, LAYOUTS, FeedParseService, $timeout) {
        /*
         * Private variables
         *
         * _data used to specify default values to save when user visit first time.
         * @type {object}
         * @private
         *
         * tmrDelay used to hold the time returned by $timeout
         * @private
         *
         *  */
        var ContentHome = this
          , _defaultData = {
            "content": {
              "carouselImages": [],
              "description": "",
              "rssUrl": "http://blog.ted.com/feed"
            },
            "design": {
              "itemListLayout": LAYOUTS.itemListLayouts[0].name,
              "itemDetailsLayout": LAYOUTS.itemDetailsLayouts[0].name,
              "itemListBgImage": "",
              "itemDetailsBgImage": ""
            },
            "default": true
          }
          , tmrDelay = null;

        /*
         * ContentHome.editor used to add, edit and delete images from your carousel.It will create a new instance of the buildfire carousel editor component.
         */
        ContentHome.editor = new Buildfire.components.carousel.editor("#carousel");

        /*
         * ContentHome.isValidUrl is used to show/hide Success alert message when rss feed url is valid. Its default value is false.
         * @type {boolean}
         */
        ContentHome.isValidUrl = false;

        /*  ContentHome.isInValidUrl is used to show/hide Error alert message when rss feed url is invalid. Its default value is false.
         * @type {boolean}
         */
        ContentHome.isInValidUrl = false;

        /* /!*
         * ContentHome.isSaved is used to show/hide Success alert message when data saved successfully. Its default value is false.
         * @type {boolean}
         *!/
         ContentHome.isSaved = false;*/

        /*
         * ContentHome.isNotSaved is used to show/hide Error alert message when data not saved. Its default value is false.
         * @type {boolean}
         */
        ContentHome.isNotSaved = false;

        /*
         * ContentHome.isValidateButtonClicked is used to disable validate button when clicked to validate RSS feed url and enabled when response has received. Its default value is false.
         * @type {boolean}
         */
        ContentHome.isValidateButtonClicked = false;


        /*
         * ContentHome.descriptionWYSIWYGOptions are optional options used for WYSIWYG text editor.
         * @type {object}
         */
        ContentHome.descriptionWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };

        /*
         * ContentHome.data is user's data of design and content sections which used throughout the app.
         * @type {object}
         */
        ContentHome.data = angular.copy(_defaultData);

        /*
         * ContentHome.masterData used to hold previous saved user's data.
         * @type {object}
         */
        ContentHome.masterData = null;

        /*
         * ContentHome.rssFeedUrl used as ng-model to show previously saved valid rss feed url.
         * @type {string}
         */
        ContentHome.rssFeedUrl = '';

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
              /*  ContentHome.isSaved = true;
               $timeout(function () {
               ContentHome.isSaved = false;
               }, 1000);*/
              updateMasterItem(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
              ContentHome.isNotSaved = true;
              $timeout(function () {
                ContentHome.isNotSaved = false;
              }, 1000);
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
            tmrDelay = setTimeout(function () {
              if (newObj.default == true) {
                delete newObj.default;

                if (newObj.content.rssUrl == _defaultData.content.rssUrl) {
                  newObj.content.rssUrl = '';
                  ContentHome.rssFeedUrl = '';
                }

              }
              console.log('0>>>>>', newObj, ContentHome.masterData);
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
                updateMasterItem(result.data);
                ContentHome.data = result.data;
              }
              if (!ContentHome.data) {
                updateMasterItem(_defaultData);
                ContentHome.data = angular.copy(_defaultData);
              } else {
                if (ContentHome.data.content && !ContentHome.data.content.carouselImages) {
                  ContentHome.editor.loadItems([]);
                }
                else {
                  ContentHome.editor.loadItems(ContentHome.data.content.carouselImages);
                }
                if (ContentHome.data.content.rssUrl)
                  ContentHome.rssFeedUrl = ContentHome.data.content.rssUrl;
              }
              //updateMasterItem(ContentHome.data);
              if (tmrDelay) {
                clearTimeout(tmrDelay)
              }
            }
            , error = function (err) {
              console.error('Error while getting data', err);
              if (tmrDelay) {
                clearTimeout(tmrDelay)
              }

            };
          DataStore.get(TAG_NAMES.RSS_FEED_INFO).then(success, error);
        };

        /**
         * function updateMasterItem(data)
         * Used to update master data with newly saved user's data object.
         * @param data is an updated data.
         */
        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        /**
         * function isUnchanged(data)
         * Used to check master data object and updated data object are same or not
         * @param data
         * @returns {*|boolean}
         */
        function isUnchanged(data) {
          console.log('-1', data, ContentHome.masterData);
          return angular.equals(data, ContentHome.masterData);
        }

        /**
         *  updateMasterItem() function invocation to update master data with default data.
         */
        updateMasterItem(_defaultData);


        /**
         *  init() function invocation to fetch previously saved user's data from datastore.
         */
        init();

        /**
         * ContentHome.editor.onAddItems function will be called when new image item(s) added to carousel image item list.
         * @param items
         */
        ContentHome.editor.onAddItems = function (items) {
          ContentHome.data.content.carouselImages.push.apply(ContentHome.data.content.carouselImages, items);
          $scope.$digest();
        };

        // this method will be called when an item deleted from the list
        /**
         * ContentHome.editor.onDeleteItem will be called when an image item deleted from carousel image item list
         * @param item
         * @param index
         */
        ContentHome.editor.onDeleteItem = function (item, index) {
          ContentHome.data.content.carouselImages.splice(index, 1);
          $scope.$digest();
        };


        /**
         * ContentHome.editor.onItemChange function will be called when you edit details of a carousel image item.
         * @param item
         * @param index
         */
        ContentHome.editor.onItemChange = function (item, index) {
          ContentHome.data.content.carouselImages.splice(index, 1, item);
          $scope.$digest();
        };


        /**
         * ContentHome.editor.onOrderChange function will be called when you change the order of image item in the list.
         * @param item
         * @param oldIndex
         * @param newIndex
         */
        ContentHome.editor.onOrderChange = function (item, oldIndex, newIndex) {
          var items = ContentHome.data.content.carouselImages;

          var tmp = items[oldIndex];

          if (oldIndex < newIndex) {
            for (var i = oldIndex + 1; i <= newIndex; i++) {
              items[i - 1] = items[i];
            }
          } else {
            for (var i = oldIndex - 1; i >= newIndex; i--) {
              items[i + 1] = items[i];
            }
          }
          items[newIndex] = tmp;

          ContentHome.data.content.carouselImages = items;
          $scope.$digest();
        };

        /**
         * ContentHome.validateFeedUrl function will called when you click validate button to check Rss feed url is either valid or not.
         */
        ContentHome.validateFeedUrl = function () {
            ContentHome.isInValidUrl="";
          Buildfire.spinner.show();
          var success = function (response) {
              ContentHome.isValidUrl = true;
              ContentHome.isValidateButtonClicked = false;
              ContentHome.data.content.rssUrl = ContentHome.rssFeedUrl;
              Buildfire.spinner.hide();
              $timeout(function () {
                ContentHome.isValidUrl = false;
                  ContentHome.urlValidationError="no response from host";
                  ContentHome.isValidateButtonClicked = false;
              }, 3000);
            }
            , error = function (response) {
              ContentHome.isInValidUrl = true;
              ContentHome.urlValidationError= "Unable to access feed URL";
              if (response && response.data && response.data.error) {
                  console.error(response.data.error);
                  console.error(response.statusCode); 
              }
              ContentHome.isValidateButtonClicked = true;
              Buildfire.spinner.hide();
              $timeout(function () {
                ContentHome.isInValidUrl = false;
                  ContentHome.urlValidationError="no response from host";
                  ContentHome.isValidateButtonClicked = false;
              }, 3000);
            };
          ContentHome.isValidateButtonClicked = true;
          FeedParseService.validateFeedUrl(ContentHome.rssFeedUrl).then(success, error);
        };

        /**
         * ContentHome.clearData function will called when RSS feed url removed from RSS feed url input box.
         */
        ContentHome.clearData = function () {
          if (!ContentHome.rssFeedUrl) {
            ContentHome.data.content.rssUrl = '';
          }
        };

        /**
         * $scope.$watch will Watch for changes in user's data object and trigger the saveDataWithDelay function if data changed
         */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);
      }]);
})(window.angular);
