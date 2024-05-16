'use strict';

(function (angular) {
  angular
    .module('mediaCenterRSSPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'DataStore', 'Buildfire', 'TAG_NAMES', 'LAYOUTS', 'FeedParseService', '$timeout', 'Utils', 'MEDIUM_TYPES',
      function ($scope, DataStore, Buildfire, TAG_NAMES, LAYOUTS, FeedParseService, $timeout, Utils, MEDIUM_TYPES) {
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
          cpLoader: new SubPage("cpLoaderDialog"),
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
        ContentHome.deletingFeed = null;

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
          const feed = new Feed({...item, type});
          switch (type) {
            case "rss":
              values = {
                rssFeedTitle: feed.title,
                rssFeedUrl: feed.url,
                enableFeedAnalytics: feed.advancedConfig.enableFeedAnalytics,
                enableSearchEngineConfig: feed.advancedConfig.enableSearchEngineConfig,
                uniqueKey: feed.advancedConfig.searchEngineItemConfig.uniqueKey,
                titleKey: feed.advancedConfig.searchEngineItemConfig.titleKey,
                urlKey: feed.advancedConfig.searchEngineItemConfig.urlKey,
                descriptionKey: feed.advancedConfig.searchEngineItemConfig.descriptionKey,
                publishDateKey: feed.advancedConfig.searchEngineItemConfig.publishDateKey,
                imageUrlKey: feed.advancedConfig.searchEngineItemConfig.imageUrlKey,
              }
              break;
            case "google":
              values = {
                googleFeedTitle: feed.title,
                googleFeedKeywords: feed.keywords,
              }
              break;
            default: break;
          }
          return values;
        }

        ContentHome.showFeedDialog = (type, item) => {
          let dialogOptions;
          if (item) {
            item = new Feed({...item, type});
            const _feed = new Feed({...item, type});
            const values = ContentHome.prepareDialogValues(_feed, type);
            dialogOptions = {
              title: type == 'rss' ? "Edit RSS Feed" : "Edit Google Feed",
              values: values,
              saveText: 'Save',
              hideDelete: false
            }
          } else {
            const values = ContentHome.prepareDialogValues({}, type);
            dialogOptions = {
              title: type == 'rss' ? "New RSS Feed" : "New Google Feed",
              saveText: 'Save',
              values: values,
              hideDelete: false
            }
          }
          
          ContentHome.subPages[type].showDialog(dialogOptions, (values) => {
            handleFeedInsertion(item, values, type);
          }, () => {
            ContentHome.subPages[type].close();
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
            ContentHome.toggleEmptyScreen();
          }

          ContentHome.sortableList.onAddButtonClick = function (options) {
            if (ContentHome.data.content.feeds.length >= 5)
              return buildfire.dialog.toast({ message: "A maximum of 5 feeds is allowed", type: "danger" });

            ContentHome.showFeedDialog(options.option.type);
          }

          ContentHome.sortableList.onItemActionClick = (options) => {
            delete options.item.subtitle;
            switch (options.actionId) {
              case "edit":
                ContentHome.showFeedDialog(options.item.type, options.item);
                break;
              case "delete":
                buildfire.dialog.confirm({
                  title: "Delete Feed",
                  message: `Are you sure you want to delete ${options.item.title} feed?`,
                  confirmButton: { type: "danger", text: "Delete" },
                }, (err, isConfirmed) => {
                  if (err) console.error(err);
                  if (isConfirmed) {
                    // unregister analytics
                    ContentHome.deletingFeed = options.item;
                    if (ContentHome.deletingFeed.advancedConfig.enableFeedAnalytics) {
                      ContentHome.handleLoaderDialog("Deleting Analytics", "Deleting analytics, this may take a while please wait...", true);
                      ContentHome.getIndexedFeedItems(`rss_feed_${options.item.id}`, options.item.url, (err, indexedFeedItems) => {
                        if(err || !indexedFeedItems || !indexedFeedItems.length) {
                          ContentHome.deletingFeed = null;
                          ContentHome.handleLoaderDialog();
                          handleSearchEngineErrors('deleting');
                          console.error(err);
                        } else {
                          // filter items to include only registered to analytics
                          indexedFeedItems = indexedFeedItems.filter(_item => _item._source.data.registeredToAnalytics);
                          AnalyticsManager.unRegisterFeedAnalytics(indexedFeedItems, (error, result) => {
                            if(error) {
                              ContentHome.deletingFeed = null;
                              ContentHome.handleLoaderDialog();
                              handleSearchEngineErrors('deleting');
                              return console.error(err);
                            }

                            handleDeleteSearchEngineData(options.item);
                          });
                        }
                      });
                    } else {
                      handleDeleteSearchEngineData(options.item);
                    }
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

        // manage CP loader 
        ContentHome.handleLoaderDialog = function (title, message, show = false) {
          if(show) {
            const showLoaderOptions = {
              hideFooter: true,
              title: title
            }
            ContentHome.subPages.cpLoader.showDialog(showLoaderOptions, () => {})
            
            if(message){
              ContentHome.subPages.cpLoader.container.querySelector('#modalMessage').innerText = message;
            }
          } else {
            ContentHome.subPages.cpLoader.close();
          }
        }

        // new CP function to get feed data
        // this will be used to register/unregister analytics
        ContentHome.getIndexedFeedItems = function (feedTag, feedURL, callback) {
          searchEngine.getIndexedFeedData(feedTag, (err, hits) => {
            if (err) return callback(err);

            // hit proxy server to fetch the feed items
            FeedParseService.getFeedData(feedURL).then((result) => {
              // map throw items to get items type
              let indexedFeedItems = hits.map(_item => {
                const proxyItem = result.data.items.find(_proxyItem => _proxyItem.guid === _item._source.data.id);
                if (!proxyItem) return null;

                _item._source.data.title = proxyItem.title;
                let enclosureData = sharedUtils.checkEnclosuresTag(proxyItem, MEDIUM_TYPES);
                let mediaTagData = sharedUtils.checkMediaTag(proxyItem, MEDIUM_TYPES);

                if (enclosureData) {
                  _item.type = enclosureData.medium;
                  _item.src = enclosureData.src;
                } else if (mediaTagData) {
                  _item.type = mediaTagData.medium;
                  _item.src = mediaTagData.src;
                }
                return _item;
              });

              indexedFeedItems = indexedFeedItems.filter(_item => _item !== null);
              callback(null, indexedFeedItems);
            }).catch((err) => {
              callback(err);
            });
          }
        )};

        const handleDeleteSearchEngineData = (item) => {
          ContentHome.handleLoaderDialog("Deleting Data", "Deleting data, please wait...", true);
          searchEngine.deleteFeed(item.id, (err, result) => {
            ContentHome.deletingFeed = null;
            ContentHome.handleLoaderDialog();
            if (err) {
              handleSearchEngineErrors('deleting');
              return console.error(err);
            }
            
            ContentHome.data.content.feeds = ContentHome.data.content.feeds.filter((el, ind) => el.id !== item.id);
            ContentHome.sortableList.remove(item.id);
            ContentHome.toggleEmptyScreen();
            $scope.$digest();
          });
        }

        const handleFeedInsertion = (item, values, type) => {
          const insertFeedToList = (feed) => {
            if (item) { // update RSS feed
              let index = ContentHome.data.content.feeds.findIndex(el => el.id == item.id);

              // change the id if the user is updating the default feed
              if (feed.id === 'default') {
                feed.id = Utils.nanoid();
                if (index > -1) {
                  ContentHome.data.content.feeds[index] = feed;
                } else {
                  ContentHome.data.content.feeds.push(feed);
                }
                ContentHome.sortableList.remove('default');
                ContentHome.sortableList.append(ContentHome.prepareFeeds(ContentHome.data.content.feeds));
              } else {
                ContentHome.data.content.feeds[index] = feed;
                ContentHome.sortableList.update(index, ContentHome.prepareFeeds([ContentHome.data.content.feeds[index]])[0]);
              }
              ContentHome.subPages[type].close();
            } else { // add new RSS feed
              if (!ContentHome.data.content.feeds) ContentHome.data.content.feeds = [feed];
              else ContentHome.data.content.feeds.push(feed);
              ContentHome.subPages[type].close();
              ContentHome.sortableList.append(ContentHome.prepareFeeds(ContentHome.data.content.feeds));
            }
            ContentHome.data.content.rssUrl = ContentHome.rssFeedUrl;
            if (!$scope.$$phase) $scope.$digest();
          }

          switch (type) {
            case "rss":
              const feed = new Feed({
                id: item ? item.id : Utils.nanoid(),
                title: values.rssFeedTitle,
                url: values.rssFeedUrl,
                type,
                advancedConfig: {
                  enableFeedAnalytics: values.enableFeedAnalytics,
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
              const isEquals = utils.checkEquality(new Feed({...item, type}), feed);
              if (isEquals) { // if no changes made, close the dialog
                ContentHome.handleLoaderDialog();
                ContentHome.subPages[type].close();
                return;
              }

              ContentHome.handleLoaderDialog("Validating Feed", "Validating feed URL, please wait...", true);
              ContentHome.validateFeedUrl(values.rssFeedUrl, (errors) => {
                if (errors) {
                  ContentHome.handleLoaderDialog();
                  ContentHome.subPages[type].showInvalidFeedMessage("rss", errors);
                } else {
                  ContentHome.activeRssFeed = feed;
                  if (item) {
                    ContentHome.activeRssFeed.isAnalyticsFlagChanged = item.advancedConfig.enableFeedAnalytics !== feed.advancedConfig.enableFeedAnalytics;
                    searchEngine.hasFeedConfigChanged(feed, (err, isChanged) => {
                      if (err) {
                        ContentHome.handleLoaderDialog();
                        ContentHome.activeRssFeed = null;
                        handleSearchEngineErrors('updating');
                        return console.error(err);
                      }
                      if (isChanged) {
                        // delete old search engine data
                        ContentHome.handleLoaderDialog("Deleting Old Data", "Deleting old search data, this may take a while please wait...", true);
                        if (item.advancedConfig.enableFeedAnalytics) {
                          // do unregister analytics
                          ContentHome.getIndexedFeedItems(`rss_feed_${item.id}`, item.url, (err, indexedFeedItems) => {
                            if(err || !indexedFeedItems || !indexedFeedItems.length) {
                              ContentHome.handleLoaderDialog();
                              handleSearchEngineErrors('updating');
                              console.error(err);
                            } else {
                              // filter items to include only registered to analytics
                              indexedFeedItems = indexedFeedItems.filter(_item => _item._source.data.registeredToAnalytics);
                              AnalyticsManager.unRegisterFeedAnalytics(indexedFeedItems, (error, result) => {
                                if(error) {
                                  ContentHome.handleLoaderDialog();
                                  handleSearchEngineErrors('updating');
                                  return console.error(error);
                                }
                                searchEngine.deleteFeed(item.id, (err, result) => {
                                  if (err) {
                                    ContentHome.handleLoaderDialog();
                                    ContentHome.activeRssFeed = null;
                                    handleSearchEngineErrors('updating');
                                    return console.error(err);
                                  }
                                  insertFeedToList(feed);
                                });
                              });
                            }
                          });
                        } else {
                          searchEngine.deleteFeed(item.id, (err, result) => {
                            if (err) {
                              ContentHome.handleLoaderDialog();
                              ContentHome.activeRssFeed = null;
                              handleSearchEngineErrors('updating');
                              return console.error(err);
                            }
                            insertFeedToList(feed);
                          });
                        }
                      } else {
                        if (item.advancedConfig.enableFeedAnalytics && !feed.advancedConfig.enableFeedAnalytics) {
                          // unregister analytics
                          ContentHome.handleLoaderDialog("Deleting Analytics", "Deleting analytics, this may take a while please wait...", true);
                          ContentHome.getIndexedFeedItems(`rss_feed_${item.id}`, item.url, (err, indexedFeedItems) => {
                            if(err || !indexedFeedItems || !indexedFeedItems.length) {
                              ContentHome.handleLoaderDialog();
                              handleSearchEngineErrors('updating');
                              console.error(err);
                            } else {
                              // filter items to include only registered to analytics
                              indexedFeedItems = indexedFeedItems.filter(_item => _item._source.data.registeredToAnalytics);
                              AnalyticsManager.unRegisterFeedAnalytics(indexedFeedItems, (error, result) => {
                                if(error) {
                                  ContentHome.handleLoaderDialog();
                                  handleSearchEngineErrors('updating');
                                  return console.error(error);
                                }
                                insertFeedToList(feed);
                              });
                            }
                          });
                        } else {
                          insertFeedToList(feed);
                        }
                      }
                    });
                  } else {
                    insertFeedToList(feed);
                  }
                }
              });
              break;
            case "google":
              let excededMaximumKeywords = values.googleFeedKeywords.split(',').length > 2;
              if(excededMaximumKeywords) {
                ContentHome.subPages[type].showInvalidFeedMessage("google", "Maximum of two keywords is allowed");
              } else {
                const feed = new Feed({
                  id: item ? item.id : Utils.nanoid(),
                  title: values.googleFeedTitle,
                  keywords: values.googleFeedKeywords,
                  type
                });
                insertFeedToList(feed);
              }
              break;
            default: break;
          }
        }

        const indexingSearchEngineData = () => {
          searchEngine.hasFeedConfigChanged(ContentHome.activeRssFeed, (err, isChanged) => {
            if (err) {
              ContentHome.activeRssFeed = null;
              ContentHome.handleLoaderDialog();
              handleSearchEngineErrors('indexing');
              return console.error(err);
            }

            if (isChanged || ContentHome.activeRssFeed.isAnalyticsFlagChanged) {
              ContentHome.handleLoaderDialog("Indexing Data", "Indexing data for search results, please wait...", true);
              searchEngine.insertFeed(ContentHome.activeRssFeed, (err, result) => {
                if (err) {
                  ContentHome.handleLoaderDialog();
                  if (err.errorMessage && err.innerError && err.innerError.error) {
                    if (err.innerError.error === 'no feeds available in the specified url') {
                      // don't show indexing error because the feed is empty
                    } else if (err.innerError.error.indexOf('unique_key') > -1) {
                      handleSearchEngineErrors('uniqueKey');
                    } else if (err.innerError.error.indexOf('title_key') > -1) {
                      handleSearchEngineErrors('titleKey');
                    } else {
                      handleSearchEngineErrors('indexing');
                    }
                  } else {
                    handleSearchEngineErrors('indexing');
                  }
                  console.error(err);
                } else {
                  ContentHome.getIndexedFeedItems(`rss_feed_${ContentHome.activeRssFeed.id}`, ContentHome.activeRssFeed.url, (err, indexedFeedItems) => {
                    if(err || !indexedFeedItems || !indexedFeedItems.length) {
                      ContentHome.activeRssFeed = null;
                      ContentHome.handleLoaderDialog();
                      handleSearchEngineErrors('analytics');
                      console.error(err);
                    } else {
                      // filter items to include only non-registered to analytics
                      indexedFeedItems = indexedFeedItems.filter(_item => !_item._source.data.registeredToAnalytics);
                      if (ContentHome.activeRssFeed.advancedConfig.enableFeedAnalytics) {
                        ContentHome.handleLoaderDialog("Prepare Analytics", "Prepare analytics for data, please wait...", true);
                        ContentHome.activeRssFeed = null;
                        AnalyticsManager.registerFeedAnalytics(indexedFeedItems, (error, result) => {
                          if (error) {
                            ContentHome.handleLoaderDialog();
                            handleSearchEngineErrors('analytics');
                            return console.error(error);
                          }
                          indexedFeedItems = indexedFeedItems.map(item => ({...item, registeredToAnalytics: true}));
                          searchEngine.updateFeedRecords(indexedFeedItems, (e, r) => {
                            if (e) console.error(e);
                            // hide the CP loader and end the procees
                            ContentHome.handleLoaderDialog();
                          });
                        });
                      } else {
                        ContentHome.activeRssFeed = null;
                        searchEngine.updateFeedRecords(indexedFeedItems, (e, r) => {
                          if (e) console.error(e);
                          // hide the CP loader and end the procees
                          ContentHome.handleLoaderDialog();
                        });
                      }
                    }
                  });
                }
              });
            } else {
              ContentHome.activeRssFeed = null;
              ContentHome.handleLoaderDialog();
            }
          });
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
            updateMasterItem(newObj);
            ContentHome.toggleEmptyScreen();
            if (ContentHome.activeRssFeed) {
              ContentHome.subPages.rss.close();
              ContentHome.handleLoaderDialog("Fetching Data", "Fetching data, please wait...", true);
              indexingSearchEngineData();
            } else {
              ContentHome.handleLoaderDialog();
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
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.RSS_FEED_INFO);
            }, 500);
          }
        };

        const handleSearchEngineErrors = (errType) => {
          let title = "", message = "";
          switch (errType) {
            case 'indexing':
              title = "Indexing Error";
              message = "Error indexing data. Please try adding the feed again.";
              break;
            case 'deleting':
              title = "Deletion Error";
              message = "Error deleting data. Please try deleting the feed again.";
              break;
            case 'updating':
              title = "Updating Error";
              message = "Error updating data. Please try updating the feed again.";
              break;
            case 'uniqueKey':
              title = "Unique Key Error";
              message = "Invalid Unique Key. Please correct the key in the feed's advanced settings and try again. Without correct key feed items won't show in search results.";
              break;
            case 'titleKey':
              title = "Title Key Error";
              message = "Invalid Title Key. Please correct the key in the feed's advanced settings and try again. Without correct key feed items won't show in search results.";
              break;
            case 'analytics':
              title = "Analytics Error";
              message = "Error setting analytics. Please try adding the feed again.";
              break;
            case 'analyticsUpdates':
              title = "Analytics Error";
              message = "An error while occurred updating the analytics.";
              break;
            default:
              break;
          }
          buildfire.dialog.alert({ title, message });
        };

        /**
         * syncFeedAnalytics(feeds) private function
         * It will sync the feed items with the analytics and search engine
         * @param feeds is an array of feeds
         */
        let showUpdateDialog = false;
        let updateAnalyticsError = false;
        const syncFeedAnalytics = (feeds) => {
          if (!feeds.length) {
            ContentHome.handleLoaderDialog();
            if (updateAnalyticsError) {
              handleSearchEngineErrors('analyticsUpdates');
            } else if (showUpdateDialog) {
              buildfire.dialog.alert({
                title: "Analytics Updates",
                message: "Analytics updated successfully.",
              });
            }
            return;
          }

          const rssFeed = feeds.shift();
          if (rssFeed.type !== 'rss' || !rssFeed.advancedConfig || !rssFeed.advancedConfig.enableFeedAnalytics) return syncFeedAnalytics(feeds);
          
          ContentHome.getIndexedFeedItems(`rss_feed_${rssFeed.id}`, rssFeed.url, (err, indexedFeedItems) => {
            if (err) console.error(err);

            // if the feed is under processing 'delete/update' then skip the analytics update
            const feedStillCanUpdate = !((ContentHome.deletingFeed && ContentHome.deletingFeed.id === rssFeed.id) || (ContentHome.activeRssFeed && ContentHome.activeRssFeed.id === rssFeed.id));
            if (!indexedFeedItems || !indexedFeedItems.length || !feedStillCanUpdate) return syncFeedAnalytics(feeds);

            // filter items to include only non-registered to analytics
            indexedFeedItems = indexedFeedItems.filter(_item => !_item._source.data.registeredToAnalytics);

            if (!showUpdateDialog && indexedFeedItems.length > 20) {
              showUpdateDialog = true;
              ContentHome.handleLoaderDialog("Updating Analytics", "Updating analytics, this may take a while please wait...", true);
              buildfire.dialog.alert({
                title: "Analytics Updates",
                message: "We are updating your Analytics, please do not close your browser or leave the plugin until you see success dialog. This may take a while...",
              });
            }
            AnalyticsManager.registerFeedAnalytics(indexedFeedItems, (error, result) => {
              if (error) {
                console.error(error);
                updateAnalyticsError = true;
                return syncFeedAnalytics(feeds);
              }

              indexedFeedItems = indexedFeedItems.map(item => ({...item, registeredToAnalytics: true}));
              searchEngine.updateFeedRecords(indexedFeedItems, (e, r) => {
                if (e) {
                  console.error(e);
                  updateAnalyticsError = true;
                }
                return syncFeedAnalytics(feeds);
              });
            });
          });
        }

        /**
         * init() private function
         * It is used to fetch previously saved user's data
         */
        var init = function () {
          var success = function (result) {
            if (Object.keys(result.data).length > 0) {
              updateMasterItem(result.data);
              ContentHome.data = result.data;
            }
            if (!ContentHome.data) {
              updateMasterItem(_defaultData);
              ContentHome.data = angular.copy(_defaultData);
            } else {
              if (!ContentHome.data.isAnalyticsRegistered) {
                AnalyticsManager.init((err) => {
                  if (err) console.error(err);

                  ContentHome.data.isAnalyticsRegistered = true;
                  ContentHome.data.default = false;
                  saveDataWithDelay({...ContentHome.data, default: false, isAnalyticsRegistered: true});
                });
              } else if (ContentHome.data.content.feeds && ContentHome.data.content.feeds.length) {
                const feeds = angular.copy(ContentHome.data.content.feeds);
                syncFeedAnalytics(feeds);
              }
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
                  id: Utils.nanoid(),
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

        ContentHome.toggleEmptyScreen = function (){
          const loadingContainer = document.getElementById('emptyListContainer');
          if (!ContentHome.sortableList || !ContentHome.sortableList.items || !ContentHome.sortableList.items.length) {
            loadingContainer.classList.remove('hidden');
            loadingContainer.innerHTML = '<h4>No Feeds Found.</h4>';
          } else {
            loadingContainer.classList.add('hidden');
          }
        }

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
