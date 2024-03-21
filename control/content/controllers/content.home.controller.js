'use strict';

(function (angular) {
  angular
    .module('mediaCenterRSSPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'DataStore', 'Buildfire', 'TAG_NAMES', 'LAYOUTS', 'FeedParseService', '$timeout', 'Utils',
      function ($scope, DataStore, Buildfire, TAG_NAMES, LAYOUTS, FeedParseService, $timeout, Utils) {
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
              "rssUrl": null, // "https://blog.ted.com/feed",
              "feeds": [
                {
                  id: "default",
                  title: "Feed",
                  type: "rss",
                  url: "https://blog.ted.com/feed"
                }
              ]
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
        ContentHome.errorMessage = false;
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

        /*
         * ContentHome.isValidateButtonClicked is used to disable validate button when clicked to validate RSS feed url and enabled when response has received. Its default value is false.
         * @type {boolean}
         */
        ContentHome.isValidateButtonClicked = false;

        ContentHome.subPages = {
          rss: new SubPage("rssFeedDialog"),
          google: new SubPage("googleFeedDialog"),
        }


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
        ContentHome.activeRssFeed = null;

        ContentHome.prepareFeeds = (feeds) => {
          return feeds.map(el => {
            return {
              subtitle: el.type == "rss" ? "RSS Feed" : "Google Feed",
              ...el,
            }
          });
        }
        ContentHome.clearUpFeeds = (feeds) => {
          return feeds.map(el => {
            delete el.subtitle;
            return {
              ...el
            }
          });
        }

        ContentHome.prepareDialogValues = (item, type) => {
          let values = {};
          switch (type) {
            case "rss":
              const rssFeed = new RssFeed(item);
              values = {
                rssFeedTitle: rssFeed.title,
                rssFeedUrl: rssFeed.url,
                enableSearchEngineConfig: rssFeed.advancedConfig.enableSearchEngineConfig,
                uniqueKey: rssFeed.advancedConfig.searchEngineItemConfig.uniqueKey,
                titleKey: rssFeed.advancedConfig.searchEngineItemConfig.titleKey,
                urlKey: rssFeed.advancedConfig.searchEngineItemConfig.urlKey,
                descriptionKey: rssFeed.advancedConfig.searchEngineItemConfig.descriptionKey,
                publishDateKey: rssFeed.advancedConfig.searchEngineItemConfig.publishDateKey,
                imageUrlKey: rssFeed.advancedConfig.searchEngineItemConfig.imageUrlKey,
              }
              break;
            case "google":
              const googleFeed = new GoogleFeed(item);
              values = {
                googleFeedTitle: googleFeed.title,
                googleFeedKeywords: googleFeed.keywords,
              }
              break;
            default: break;
          }
          return values;
        }

        ContentHome.showAddDialog = (type) => {
          const values = ContentHome.prepareDialogValues({}, type);
          ContentHome.subPages[type].showDialog({
            title: type == 'rss' ? "New RSS Feed" : "New Google Feed",
            saveText: 'Save',
            values: values,
            hideDelete: false
          }, (values) => {
            let feed = {};
            switch (type) {
              case "rss":
                feed = new RssFeed({
                  id: Utils._nanoid(),
                  title: values.rssFeedTitle,
                  url: values.rssFeedUrl,
                  advancedConfig: {
                    enableSearchEngineConfig: values.enableSearchEngineConfig,
                    searchEngineItemConfig: {
                      uniqueKey: values.uniqueKey,
                      titleKey: values.titleKey,
                      descriptionKey: values.descriptionKey,
                      urlKey: values.urlKey,
                      publishDateKey: values.publishDateKey,
                      imageUrlKey: values.imageUrlKey,
                    }
                  }
                });
                ContentHome.activeRssFeed = feed;
                break;
              case "google":
                feed = new GoogleFeed({
                  id: Utils._nanoid(),
                  title: values.googleFeedTitle,
                  keywords: values.googleFeedKeywords,
                });
                break;
              default:
                break;
            }

            const addFeed = () => {
              if (!ContentHome.data.content.feeds)
                ContentHome.data.content.feeds = [feed];
              else ContentHome.data.content.feeds.push(feed);

              ContentHome.subPages[type].close();
              if (!$scope.$$phase) $scope.$digest();
              ContentHome.sortableList.append(ContentHome.prepareFeeds(ContentHome.data.content.feeds));
            }

            if (type === 'rss') {
              ContentHome.validateFeedUrl(values.rssFeedUrl, (errors) => {
                if (errors) ContentHome.subPages[type].showInvalidFeedMessage("rss", errors);
                else {
                  addFeed();
                }
              });
            } else if (type === 'google'){
              let excededMaximumKeywords = values.googleFeedKeywords.split(',').length > 2;
              if(excededMaximumKeywords) {
                ContentHome.subPages[type].showInvalidFeedMessage("google", "Maximum of two keywords is allowed");
              } else addFeed();
            }
          }, () => {
            ContentHome.subPages[type].close();
          });
        }

        ContentHome.showEditDialog = (item) => {
          const _feed = item.type == "rss" ? new RssFeed(item) : new GoogleFeed(item);
          const values = ContentHome.prepareDialogValues(_feed, item.type);
          ContentHome.subPages[item.type].showDialog({
            title: item.type == 'rss' ? "Edit RSS Feed" : "Edit Google Feed",
            values: values,
            saveText: 'Save',
            hideDelete: false
          }, (values) => {
            let index = ContentHome.data.content.feeds.findIndex(el => el.id == item.id);
            switch (item.type) {
              case "rss":
                ContentHome.validateFeedUrl(values.rssFeedUrl, (errors) => {
                  if (errors) ContentHome.subPages[item.type].showInvalidFeedMessage("rss", errors);
                  else {
                    const updatedFeed = new RssFeed({
                      id: item.id,
                      title: values.rssFeedTitle,
                      url: values.rssFeedUrl,
                      advancedConfig: {
                        enableSearchEngineConfig: values.enableSearchEngineConfig,
                        searchEngineItemConfig: {
                          uniqueKey: values.uniqueKey,
                          titleKey: values.titleKey,
                          descriptionKey: values.descriptionKey,
                          urlKey: values.urlKey,
                          publishDateKey: values.publishDateKey,
                          imageUrlKey: values.imageUrlKey,
                        }
                      }
                    });
                    ContentHome.activeRssFeed = updatedFeed;
                    ContentHome.data.content.feeds[index] = updatedFeed;
                    ContentHome.subPages[item.type].close();
                    ContentHome.sortableList.update(index, ContentHome.prepareFeeds([ContentHome.data.content.feeds[index]])[0]);
                  }
                });
                break;
              case "google":
                let excededMaximumKeywords = values.googleFeedKeywords.split(',').length > 2;
                if(excededMaximumKeywords) {
                  ContentHome.subPages[item.type].showInvalidFeedMessage("google", "Maximum of two keywords is allowed");
                } else {
                  const updatedFeed = new GoogleFeed({
                    id: item.id,
                    title: values.googleFeedTitle,
                    keywords: values.googleFeedKeywords,
                  });
                  ContentHome.data.content.feeds[index] = updatedFeed;
                  ContentHome.subPages[item.type].close();
                  ContentHome.sortableList.update(index, ContentHome.prepareFeeds([ContentHome.data.content.feeds[index]])[0]);
                }
                break;
              default: break;
            }

            $scope.$digest();
          }, () => {
            ContentHome.subPages[item.type].close();
          });
        }

        ContentHome.initSortableList = function () {
          ContentHome.sortableList = new buildfire.components.control.listView("#feeds", {
            appearance: {
              title: 'Feeds',
              addButtonText: "Add Feed"
            },
            settings: {
              showAddButton: true,
              contentMapping: {
                idKey: "id",
                columns: [
                  { titleKey: "title", subtitleKey: "subtitle" }
                ]
              }
            },
            addButtonOptions: [
              { id: 1, title: "RSS Feed", type: "rss" },
              { id: 2, title: "Google Feed", type: "google" }
            ],
          });

          ContentHome.sortableList.onDataRequest = function (options, callback) {
            if (ContentHome.data.default || !ContentHome.data.default && ContentHome.data.rssUrl) {
              callback([
                {
                  id: "default",
                  title: "Feed",
                  type: "rss",
                  subtitle: "RSS Feed",
                  url: "https://blog.ted.com/feed"
                },
              ]);
            } else {
              callback(ContentHome.prepareFeeds(ContentHome.data.content.feeds));
            }
          }

          ContentHome.sortableList.onAddButtonClick = function (options) {
            if (ContentHome.data.content.feeds.length >= 5)
              return buildfire.dialog.toast({ message: "A maximum of 5 feeds is allowed", type: "danger" });

            ContentHome.showAddDialog(options.option.type);
          }

          ContentHome.sortableList.onItemActionClick = (options) => {
            delete options.item.subtitle;
            switch (options.actionId) {
              case "edit":
                ContentHome.showEditDialog(options.item);
                break;
              case "delete":
                buildfire.dialog.confirm({ message: "Are you sure you want to delete this feed?" }, (err, isConfirmed) => {
                  if (err) console.error(err);
                  if (isConfirmed) {
                    searchEngine.deleteFeed(options.item, (err, result) => {
                      if (err) return console.error(err);
                      
                      ContentHome.data.content.feeds = ContentHome.data.content.feeds.filter((el, ind) => el.id !== options.item.id);
                      ContentHome.sortableList.remove(options.item.id);
                      $scope.$digest();
                    });
                  }
                })
                break;
              default: break;
            }
          }

          ContentHome.sortableList.onOrderChange = (options) => {
            ContentHome.data.content.feeds = options.items;
            if (!$scope.$$phase) $scope.$digest();
          }
        }

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
            if (ContentHome.activeRssFeed) {
              searchEngine.get(ContentHome.activeRssFeed.id, (err, result) => {
                if (err) console.error(err);
                else {
                  const feedUrl = result[0] ? result[0].feed_config.url : false;
                  const feedItemConfig = result[0] ? result[0].feed_item_config : {};
                  const { feedItemConfig: currentFeedItemConfig } = searchEngine.getSearchEngineOptions(ContentHome.activeRssFeed);

                  let isFeedItemConfigChanged = false,
                      currentConfigValues = Object.values(currentFeedItemConfig),
                      feedConfigValues = Object.values(feedItemConfig);

                  for (let i = 0; i < currentConfigValues.length; i++) {
                    if (feedConfigValues.indexOf(currentConfigValues[i]) === -1) {
                      isFeedItemConfigChanged = true;
                      break;
                    }
                  }
                  // TODO: need to add error handlers
                  if (!feedUrl || (feedUrl === ContentHome.activeRssFeed.url && isFeedItemConfigChanged)) {
                    searchEngine.insertFeed(ContentHome.activeRssFeed, (err, result) => {
                      if (err) return console.error(err);
                      else console.log('Feed inserted successfully', result);
                      ContentHome.activeRssFeed = null;
                    });
                  } else if (feedUrl !== ContentHome.activeRssFeed.url) {
                    searchEngine.updateFeed(ContentHome.activeRssFeed, (err, result) => {
                      if (err) return console.error(err);
                      else console.log('Feed updated successfully', result);
                      ContentHome.activeRssFeed = null;
                    });
                  }
                }
              });
            }
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
            tmrDelay = setTimeout(function () {
              if (newObj.default == true) {
                delete newObj.default;
                if (newObj.content.rssUrl == _defaultData.content.rssUrl) {
                  newObj.content.rssUrl = '';
                  ContentHome.rssFeedUrl = '';
                }
                ContentHome.data.content.feeds = ContentHome.data.content.feeds.filter(el => el.id !== "default" );
                ContentHome.sortableList.remove(0);
              } else {
                ContentHome.data.content.feeds = ContentHome.clearUpFeeds(ContentHome.data.content.feeds);
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
              if (ContentHome.data.content.rssUrl) {
                ContentHome.rssFeedUrl = ContentHome.data.content.rssUrl;
                ContentHome.data.content.feeds = [];
                ContentHome.data.content.feeds.push({
                  id: Utils._nanoid(),
                  title: "Feed",
                  type: "rss",
                  url: ContentHome.data.content.rssUrl
                });
                ContentHome.data.content.rssUrl = null;
              }
            }
            //updateMasterItem(ContentHome.data);
            ContentHome.initSortableList();
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
          }
            , error = function (err) {
              console.error('Error while getting data', err);
              if (tmrDelay) {
                clearTimeout(tmrDelay);
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
        ContentHome.validateFeedUrl = function (feedUrl, callback) {
          Buildfire.spinner.show();
          var success = function () {
            ContentHome.isValidUrl = true;
            ContentHome.isValidateButtonClicked = false;
            ContentHome.data.content.rssUrl = ContentHome.rssFeedUrl;
            Buildfire.spinner.hide();
            callback(null);
            $timeout(function () {
              ContentHome.isValidUrl = false;
            }, 3000);
          }
            , error = function (err) {
              switch (err.code) {
                case 'ETIMEDOUT': {
                  ContentHome.errorMessage = "No response from the RSS server.";
                  break;
                }
                case 'ENOTFOUND': {
                  ContentHome.errorMessage = "Can't find the requested resource. Check the URL.";
                  break;
                }
                case 500: {
                  ContentHome.errorMessage = "Something went wrong in the RSS server.";
                  break;
                }
                case 200: {
                  if (err.message === "Invalid RSS feeds format") {
                    ContentHome.errorMessage = "Feed format is invalid.";
                  }
                  break;
                }
                default: {
                  ContentHome.errorMessage = "Not a valid feed URL. Try again.";
                  break;
                }
              }
              ContentHome.isInValidUrl = true;
              ContentHome.isValidateButtonClicked = false;
              callback(ContentHome.errorMessage);
              Buildfire.spinner.hide();
              $timeout(function () {
                ContentHome.errorMessage = false;
                ContentHome.isInValidUrl = false;
              }, 3000);
            };
          ContentHome.isValidateButtonClicked = true;
          FeedParseService.validateFeedUrl(feedUrl).then(success, error);
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
