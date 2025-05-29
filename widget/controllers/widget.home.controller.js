'use strict';

(function (angular) {
    angular
        .module('mediaCenterRSSPluginWidget')
        .controller('WidgetHomeCtrl', ['$scope', 'DataStore', 'Buildfire', 'FeedParseService', 'TAG_NAMES', 'ItemDetailsService', 'Location', '$filter', 'Underscore', '$rootScope', 'FEED_IMAGES', 'trackAnalyticsActions', 'utils',
            function ($scope, DataStore, Buildfire, FeedParseService, TAG_NAMES, ItemDetailsService, Location, $filter, Underscore, $rootScope, FEED_IMAGES, trackAnalyticsActions, utils) {

                if (window.device) {
                    if (window.device.platform === 'Android') {
                        $rootScope.deviceHeight = window.outerHeight;
                        $rootScope.deviceWidth = window.outerWidth;
                    } else {
                        $rootScope.deviceHeight = window.innerHeight;
                        $rootScope.deviceWidth = window.innerWidth || 320;
                    }
                } else {
                    $rootScope.deviceHeight = window.innerHeight;
                    $rootScope.deviceWidth = window.innerWidth || 320;
                }

                const toggleDeeplinkSkeleton = (show) => {
                    const deeplinkSkeletonContainer = document.getElementById('deeplinkSkeleton');
                    if (show && !this.deeplinkSkeleton) {
                        this.deeplinkSkeleton = new buildfire.components.skeleton('#deeplinkSkeleton', {
                            type: 'image, list-item, sentence, paragraph',
                        })
                        this.deeplinkSkeleton.start();
                        deeplinkSkeletonContainer.classList.remove('hidden');
                    } else if (!show && this.deeplinkSkeleton) {
                        deeplinkSkeletonContainer.classList.add('hidden');
                        this.deeplinkSkeleton.stop();
                        this.deeplinkSkeleton = null;
                    }
                };

                function extractItemFromFeeds(feeds = {}, itemId) {
                    if (!feeds || typeof feeds !== 'object' || !itemId) return null;
                    let itemData = null;

                    Object.keys(feeds).forEach(key => {
                        if (feeds[key].items && feeds[key].items.length) {
                            let feedItem = feeds[key].items.find(el => el.guid == itemId);
                            if (feedItem) {
                                const index = feeds[key].items.indexOf(feedItem);
                                itemData = { feedItem, index };
                            }
                        }
                    });
                    return itemData;
                }

                $scope.deeplinkData = null;
                $scope.isDeeplinkItemOpened = false;
                $scope.first = true;
                $scope.waitingForDeeplinkEvent = false;
                $scope.deeplinkFinished = false;
                /**
                 * @name processDeeplink
                 * @type {function}
                 * Handles incoming bookmark navigation
                 */
                const processDeeplink = (data, pushToHistory=true) => {
                    if ($scope.first && data) {
                        if (data.feed) {
                            $scope.waitingForDeeplinkEvent = true;
                            toggleDeeplinkSkeleton();
                            const item = {
                                ...data.feed,
                                guid: data.link,
                                imageSrcUrl: data.feed.image_url ,
                                pubDate: data.feed.publish_date
                            };
                            WidgetHome.proceedToItem(-1, item, pushToHistory);
                        } else if (data.link) {
                            var targetGuid = data.link;

                            if(WidgetHome.data && WidgetHome.data.content.feeds?.length) {
                                const itemData = extractItemFromFeeds(WidgetHome.feedsCache, targetGuid);
                                if(itemData && itemData.feedItem) {
                                    if (data.timeIndex) {
                                        WidgetHome.feedsCache[key].items[itemData.index].seekTo = data.timeIndex;
                                    }
                                    $rootScope.deeplinkFirstNav = true;
                                    $scope.isDeeplinkItemOpened = true;
                                    WidgetHome.goToItem(itemData.index, itemData.feedItem, pushToHistory);
                                    $scope.deeplinkFinished = true;
                                } else if (WidgetHome.dataTotallyLoaded) {
                                    toggleDeeplinkSkeleton();
                                }
                            } else {
                                var itemLinks = _items.map(function (item) {
                                    return item.guid
                                });
                                var index = itemLinks.indexOf(targetGuid);
                                if (index < 0 && WidgetHome.dataTotallyLoaded) {
                                    console.warn('bookmarked item not found.');
                                    toggleDeeplinkSkeleton();
                                } else {
                                    if (data.timeIndex) {
                                        _items[index].seekTo = data.timeIndex;
                                    }
                                    $rootScope.deeplinkFirstNav = true;
                                    $scope.isDeeplinkItemOpened = true;
                                    WidgetHome.goToItem(index, _items[index], pushToHistory);
                                    $scope.deeplinkFinished = true;
                                }
                                $scope.first = false;
                            }
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    }
                }

                /**
                 * Private variables
                 *
                 * @name _items used to hold RSS feed items and helps in lazy loading.
                 * @type {object}
                 * @private
                 *
                 * @name limit used to load a number of items in list on scroll
                 * @type {number}
                 * @private
                 *
                 * @name chunkData used to hold chunks of _items.
                 * @type {object}
                 * @private
                 *
                 * @name nextChunkDataIndex used to hold index of next chunk.
                 * @type {number}
                 * @private
                 *
                 * @name nextChunk used to hold chunk based on nextChunkDataIndex token.
                 * @type {object}
                 * @private
                 *
                 * @name totalChunks used to hold number of available chunks i.e. chunkData.length.
                 * @type {number}
                 * @private
                 *
                 * @name currentRssUrl used to hold previously saved rss url.
                 * @type {string}
                 * @private
                 *
                 *  */
                var view = null,
                    _items = [],
                    limit = 50,
                    chunkData = null,
                    nextChunkDataIndex = 0,
                    nextChunk = null,
                    totalChunks = 0,
                    currentRssUrl = null,
                    WidgetHome = this,
                    isInit = true;

                var _data = {
                    "content": {
                        "carouselImages": [],
                        "description": "",
                        "rssUrl": null,
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
                        "itemListLayout": 'List_Layout_1',
                        "itemDetailsLayout": 'Feed_Layout_1',
                        "itemListBgImage": "",
                        "itemDetailsBgImage": ""
                    }
                };

                // show the deeplink skeleton if the deeplink is present
                try {
                    buildfire.deeplink.getData(function (data) {
                        if (!data) return;

                        $scope.deeplinkData = utils.decodeObject(data);
                        toggleDeeplinkSkeleton(true);
                    });
                } catch (e) {
                    console.error('Error getting deeplink data', e);
                }
                buildfire.deeplink.onUpdate(function (data) {
                    if (!data) return;

                    $scope.deeplinkData = data;
                    processDeeplink(data, true);
                    if ($scope.waitingForDeeplinkEvent) {
                        WidgetHome.handleInitialParsing();
                    }
                });

                /**
                 * @name WidgetHome.data is used to hold user's data object which used throughout the app.
                 * @type {object}
                 */
                WidgetHome.data = null;
                WidgetHome.view = null;
                WidgetHome.feedsCache = {};
                WidgetHome.feedsData = {};
                WidgetHome.currentFeed = null;

                /**
                 * @name WidgetHome.items is used to listing items.
                 * @type {object}
                 */
                WidgetHome.items = [];

                /**
                 * @name WidgetHome.busy is used to disable ng-infinite scroll when more data not available to show.
                 * @type {boolean}
                 */
                WidgetHome.busy = false;

                /**
                 * @name WidgetHome.isItems is used to show info message when _items.length == 0.
                 * @type {boolean}
                 */
                WidgetHome.isItems = true;

                $rootScope.showFeedList = true;

                /**
                 * @name resetDefaults()
                 * Used to reset default values
                 * @private
                 */
                var resetDefaults = function () {
                    chunkData = null;
                    nextChunkDataIndex = 0;
                    nextChunk = null;
                    totalChunks = 0;
                    _items = [];
                    WidgetHome.items = [];
                    WidgetHome.busy = false;
                    WidgetHome.isItems = true;
                    if(!$rootScope.preventResetDefaults) {
                        ItemDetailsService.setData(null);
                    }
                };


                /**
                 * @name getFeedData()
                 * @private
                 * used to fetch RSS feed Data object if a valid RSS feed url provided
                 * @param rssUrl
                 */
                var getFeedData = function (rssUrl) {
                    resetDefaults();
                    FeedParseService.getFeedData(rssUrl).then(getFeedDataSuccess, getFeedDataError);
                };
                var getFeedDataSuccess = function (result) {
                    // compare the first item, last item, and length of the cached feed vs fetched feed
                    var isUnchanged = checkFeedEquality(_items, result.data.items);
                    WidgetHome.loading = false;
                    result.rssUrl = WidgetHome.data.content.rssUrl ? WidgetHome.data.content.rssUrl : false;
                    cacheManager.setItem(undefined, result, () => { });
                    if (isUnchanged) return;

                    if (WidgetHome.items.length > 0) {
                        WidgetHome.items = [];
                        _items = [];
                        nextChunkDataIndex = 0;
                    }
                    if (result.data && result.data.items.length > 0) {
                        result.data.items.forEach(function (item) {
                            item.imageSrcUrl = utils.getImageUrl(item);
                        });
                        _items = result.data.items;
                        WidgetHome.isItems = true;
                        $scope.hideandshow = true;
                    } else {
                        WidgetHome.isItems = false;
                    }
                    chunkData = Underscore.chunk(_items, limit);
                    totalChunks = chunkData.length;
                    viewedItems.sync(WidgetHome.items);
                    bookmarks.sync($scope);
                    WidgetHome.loadMore();
                    processDeeplink($scope.deeplinkData, false);

                    isInit = false;

                    function checkFeedEquality(currentItems, fetchedItems) {

                        if (!currentItems[0] || !currentItems[0].guid) return false;

                        var sameLength = currentItems.length === fetchedItems.length;
                        var firstItemUnchanged = currentItems[0].guid === fetchedItems[0].guid;
                        var lastItemUnchanged = currentItems[currentItems.length - 1].guid === fetchedItems[fetchedItems.length - 1].guid;

                        return sameLength && firstItemUnchanged && lastItemUnchanged;
                    }
                };

                var getFeedDataError = function (err) {
                    console.error('Error while getting feed data', err);
                };


                /**
                 * @name onUpdateCallback()
                 * @private
                 * Will be called when DataStore.onUpdate() have been made.
                 * @param event
                 */
                var onUpdateCallback = function (event) {
                    if (event && event.tag === TAG_NAMES.RSS_FEED_INFO) {
                        window.location.reload();
                    }
                };
                buildfire.appearance.titlebar.isVisible(null, (err, isVisible) => {
                    if (err) return console.error(err);
                    WidgetHome.isTittlebarVisible = isVisible;
                });

                WidgetHome.isSafeArea = () => {
                    if (!WidgetHome.isTittlebarVisible && WidgetHome.data.content && !(WidgetHome.data.content.description || WidgetHome.data.content.carouselImages.length)) {
                        return true;
                    }
                    else return false;
                }

                WidgetHome.fetchFeed = (feed) => {
                    buildfire.appearance.ready();
                    let url = null;
                    if (feed.type === 'google') {
                        const baseUrl = 'https://news.google.com/rss/search';
                        const keywords = encodeURIComponent(feed.keywords.replaceAll(",", "AND"));
                        const rssUrl = `${baseUrl}?q=${keywords}&hl=en&gl=US&ceid=US:en`;
                        url = rssUrl;
                    } else url = feed.url;
                    currentRssUrl = url;

                    getFeedData(url);
                }

                WidgetHome.processDatastore = (result) => {
                    viewedItems.init();

                        if (Object.keys(result.data).length > 0) {
                            WidgetHome.data = result.data;
                            $rootScope.data = result.data;
                        } else {
                            WidgetHome.data = _data;
                            $rootScope.data = _data;
                        }
                        if (WidgetHome.data.design) {
                            $rootScope.backgroundImage = WidgetHome.data.design.itemListBgImage;
                            $rootScope.backgroundImageItem = WidgetHome.data.design.itemDetailsBgImage;
                        }
                        if (!WidgetHome.data.design) {
                            WidgetHome.data.design = {};
                        }
                        if (!WidgetHome.data.design.showImages) {
                            WidgetHome.data.design.showImages = FEED_IMAGES.YES;
                        }
                    $scope.hideandshow = true;
                }

                WidgetHome.fetchFeedResults = (feed) => {
                    return new Promise((resolve, reject) => {
                        let url = null;
                        if (feed.type === 'google') {
                            const baseUrl = 'https://news.google.com/rss/search';
                            const keywords = encodeURIComponent(feed.keywords.replaceAll(",", "AND"));
                            const rssUrl = `${baseUrl}?q=${keywords}&hl=en&gl=US&ceid=US:en`;
                            url = rssUrl;
                        } else url = feed.url;

                        FeedParseService.getFeedData(url).then((result) => {
                            resolve(result);
                        }, (err) => {
                            reject(err);
                        });
                    });
                }

                WidgetHome.checkIfFeedChanged = (feedId) => {
                    if (WidgetHome.feedsCache[feedId] && WidgetHome.feedsCache[feedId].isChanged) {
                        return true;
                    }
                    else return false;
                }

                WidgetHome.initializeTabs = () => {
                    setTimeout(() => {
                        WidgetHome.activeTab = 0;
                        let tabs = document.querySelector('.mdc-tab-bar');
                        if (!tabs) return;
                        tabs.classList.remove('hidden');
                        const tabBar = new mdc.tabBar.MDCTabBar(tabs);
                        tabBar.listen('MDCTabBar:activated', (event) => {
                            WidgetHome.activeTab = event.detail.index;
                            WidgetHome.parseFeed(WidgetHome.data.content.feeds[WidgetHome.activeTab]);
                            WidgetHome.currentFeed = WidgetHome.data.content.feeds[event.detail.index];
                            WidgetHome.renderFeedItems();
                            WidgetHome.feedsCache[WidgetHome.currentFeed.id].isChanged = false;
                            cacheManager.setItem(WidgetHome.currentFeed.id, WidgetHome.feedsCache[WidgetHome.currentFeed.id], () => { });
                        });
                    }, 0);
                }

                WidgetHome.renderFeedItems = function () {
                    let allItems = WidgetHome.feedsCache[WidgetHome.currentFeed.id].items;
                    WidgetHome.prepareFeedImages(WidgetHome.currentFeed.id);
                    WidgetHome.items = [];
                    nextChunkDataIndex = 0;
                    if(allItems?.length) {
                        WidgetHome.isItems = true;
                    } else  WidgetHome.isItems = false;
                    _items = allItems;
                    chunkData = Underscore.chunk(_items, limit);
                    totalChunks = chunkData.length;
                    WidgetHome.loadMore();
                    viewedItems.sync(WidgetHome.items);
                    bookmarks.sync($scope);
                    if(!$scope.$$phase)$scope.$digest();
                }

                WidgetHome.checkFeedEquality = function (currentItems, fetchedItems) {
                    if (!(currentItems[0] && currentItems[0].guid) && !fetchedItems.length) return true;
                    if (!currentItems[0] || !currentItems[0].guid) return false;

                    let sameLength = currentItems.length === fetchedItems.length;

                    let currentItemsString = currentItems.map(element => {
                        return element.guid + element.link
                    }).sort().toString();
                    currentItemsString = currentItemsString.toString();

                    let fetchedItemsString = fetchedItems.map(element => {
                        return element.guid + element.link
                    }).sort().toString();
                    return sameLength && currentItemsString === fetchedItemsString;
                }

                WidgetHome.prepareFeedImages = (id) => {
                    WidgetHome.feedsCache[id].items?.forEach((item) => {
                        item.imageSrcUrl = utils.getImageUrl(item);
                    });
                }

                WidgetHome.parseFeed = (feed, callback) => {
                    if (!feed || WidgetHome.feedsData[feed.id]) return;
                    if (!WidgetHome.feedsCache[feed.id] || !WidgetHome.feedsCache[feed.id].items || !WidgetHome.feedsCache[feed.id].items.length) {
                        WidgetHome.loading = true;
                        if (!$scope.$$phase) $scope.$digest();
                    }

                    WidgetHome.fetchFeedResults(feed).then((result) => {
                        let isChanged = !WidgetHome.checkFeedEquality(WidgetHome.feedsCache[feed.id].items ?? [], result.data.items);
                        WidgetHome.feedsCache[feed.id] = {
                            isChanged,
                            items: result.data.items ?? []
                        };
                        WidgetHome.feedsData[feed.id] = result.data;

                        if (!$scope.$$phase) $scope.$digest();
                        cacheManager.setItem(feed.id, WidgetHome.feedsCache[feed.id], () => { });

                        if (isChanged) WidgetHome.renderFeedItems();
                        WidgetHome.loading = false;

                        if (Object.keys(WidgetHome.feedsData).length === WidgetHome.data.content.feeds.length) WidgetHome.dataTotallyLoaded = true;

                        if (!$scope.$$phase) $scope.$digest();
                        if (callback) callback();
                    }).catch((err) => {
                        console.error(err);

                        WidgetHome.loading = false;
                        if (!$scope.$$phase) $scope.$digest();
                    });
                }

                WidgetHome.handleInitialParsing = () => {
                    if ($scope.deeplinkData) {
                        if ($scope.waitingForDeeplinkEvent) {
                            const itemData = extractItemFromFeeds(WidgetHome.feedsCache, $scope.deeplinkData.link);
                            if (itemData && itemData.feedItem) {
                                $scope.deeplinkFinished = true;
                                ItemDetailsService.setData(itemData.feedItem);
                                $rootScope.$broadcast('deeplinkItemReady', itemData.feedItem);
                            }
                        } else {
                            processDeeplink($scope.deeplinkData, false);
                        }
                        if (!$scope.deeplinkFinished && !WidgetHome.dataTotallyLoaded) {
                            const nextFeedIndex = WidgetHome.data.content.feeds.findIndex(feed => !WidgetHome.feedsData[feed.id]);
                            WidgetHome.parseFeed(WidgetHome.data.content.feeds[nextFeedIndex], WidgetHome.handleInitialParsing);
                        }
                    } else {
                        const firstFeed = WidgetHome.data.content.feeds[0];
                        WidgetHome.parseFeed(firstFeed, WidgetHome.handleInitialParsing);
                    }
                }

                WidgetHome.initializePlugin = function () {
                    DataStore.get(TAG_NAMES.RSS_FEED_INFO).then((settings) => {
                        WidgetHome.processDatastore(settings);
                        WidgetHome.loading = true;
                        if (!Object.keys(settings.data).length) {
                            settings.data = WidgetHome.data;
                        }

                        //if settings data contains rssUrl proceed with old logic
                        if (!settings.data.content.feeds?.length && settings.data.content.rssUrl) {
                            cacheManager.getItem().then((data) => {
                                if (!data || !WidgetHome.data.content || data.rssUrl != WidgetHome.data.content.rssUrl) {
                                    WidgetHome.isItems = false;
                                    if (!$scope.$$phase) $scope.$digest();
                                    return;
                                }
                                getFeedDataSuccess(data);
                            });
                            currentRssUrl = WidgetHome.data.content.rssUrl;
                            buildfire.appearance.ready();
                            getFeedData(WidgetHome.data.content.rssUrl);
                        }
                        //if settings data has feeds proceed with new logic
                        else if (settings.data.content.feeds && !settings.data.content.rssUrl) {
                            processDeeplink($scope.deeplinkData, false);
                            if (!settings.data.content.feeds.length) {
                                WidgetHome.isItems = false;
                                WidgetHome.loading = false;
                            }
                            let cachePromises = [], dataPromises = [];
                            settings.data.content.feeds.map((feed) => {
                                cachePromises.push(cacheManager.getItem(feed.id).then(r => ({ id: feed.id, result: r })));
                            });
                            WidgetHome.initializeTabs();

                            WidgetHome.currentFeed = settings.data.content?.feeds[0];
                            if (!WidgetHome.currentFeed) return;
                            Promise.all(cachePromises).then(results => {
                                results.forEach((el) => {
                                    if (Object.keys(el).length > 0)
                                        WidgetHome.feedsCache[el.id] = el.result ?? {};
                                });
                                if (!$scope.$$phase) $scope.$digest();
                                WidgetHome.renderFeedItems();
                                if (WidgetHome.isItems) {
                                    WidgetHome.loading = false;
                                }

                                WidgetHome.handleInitialParsing();
                            }).catch((err) => {
                                console.error(err)
                            });
                        }
                    }, (err) => console.error(err));
                };

                WidgetHome.initializePlugin();


                /**
                 * @name DataStore.onUpdate() will invoked when there is some change in datastore
                 */
                DataStore.onUpdate().then(null, null, onUpdateCallback);

                /**
                 * @name WidgetHome.showDescription() method
                 * will be called to check whether the description have text to show or no.
                 * @param description
                 * @returns {boolean}
                 */
                WidgetHome.showDescription = function (description) {
                    var _retVal = false;
                    description = description.trim();
                    if (description && (description !== '<p>&nbsp;<br></p>') && (description !== '<p><br data-mce-bogus="1"></p>')) {
                        _retVal = true;
                    }
                    return _retVal;
                };

                /**
                 * @name WidgetHome.getTitle() method
                 * Will used to extract item title
                 * @param item
                 * @returns {item.title|*}
                 */
                WidgetHome.getTitle = function (item) {
                    if (item) {
                        var truncatedTitle = '';
                        if (!item.title && (item.summary || item.description)) {
                            var html = item.summary ? item.summary : item.description;
                            item.title = html;
                            truncatedTitle = $filter('truncate')(html, 50);
                        } else {
                            truncatedTitle = $filter('truncate')(item.title, 50);
                        }
                        return truncatedTitle;
                    }
                };

                /**
                 * @name WidgetHome.getFullTitle() method
                 * Will used to extract item title
                 * @param item
                 * @returns {item.title|*}
                 */
                WidgetHome.getFullTitle = function (item) {
                    if (item) {
                        if (!item.title && (item.summary || item.description)) {
                            var html = item.summary ? item.summary : item.description;
                            item.title=html;
                            return html;
                        } else {
                            return item.title;
                        }
                    }
                };

                /**
                 * @name WidgetHome.getItemSummary() method
                 * Will used to extract item summary
                 * @param item
                 * @returns {*}
                 */
                WidgetHome.getItemSummary = function (item) {
                    if (item && (item.summary || item.description)) {
                        var html = item.summary ? item.summary : item.description;
                        return $filter('truncate')(html, 100);
                    } else {
                        return '';
                    }
                };

                /**
                 * @name WidgetHome.getItemPublishDate() method
                 * Will used to extract item published date
                 * @param item
                 * @returns {*}
                 */
                WidgetHome.getItemPublishDate = function (item) {
                    if (item) {
                        var dateStr = item.pubDate ? item.pubDate : '';
                        if (dateStr) {
                            return $filter('date')(dateStr, 'MMM dd, yyyy');
                        } else {
                            return dateStr;
                        }
                    }
                };

                /**
                 * @name WidgetHome.goToItem() method
                 * will used to redirect on details page
                 * @param index
                 */
                WidgetHome.goToItem = function (index, item, pushToHistory = true) {
                    $rootScope.preventResetDefaults = true;
                    if (!WidgetHome.data.preferLinkPage || !item.link) $rootScope.showFeedList = false;

                    if(WidgetHome.data.readRequiresLogin) {
                        buildfire.auth.getCurrentUser(function (err, user) {
                            if (err) {
                                toggleDeeplinkSkeleton();
                                return console.error(err);
                            }
                            if (user) {
                                WidgetHome.proceedToItem(index, item, pushToHistory);
                            } else {
                                buildfire.auth.login({ allowCancel: true }, function(err, user) {
                                    if (err) {
                                        toggleDeeplinkSkeleton();
                                        return console.error(err);
                                    }
                                    if (user) {
                                        WidgetHome.proceedToItem(index, item, pushToHistory);
                                    }
                                });
                            }
                        });
                    } else {
                        WidgetHome.proceedToItem(index, item, pushToHistory);
                    }
                };
                WidgetHome.proceedToItem = function (index, item, pushToHistory) {
                    if (WidgetHome.items[index]) {
                        setTimeout(function () {
                            viewedItems.markViewed($scope, item.guid);
                        }, 500);
                        WidgetHome.items[index].index = index;
                    }
                    if (WidgetHome.data.preferLinkPage && item.link) {
                        if (Buildfire.getContext().device.platform === 'web'){
                            window.open(item.link, '_blank')
                        }
                        else {
                            Buildfire.navigation.openWindow(item.link, '_system');
                        }
                        return;
                    }
                    toggleDeeplinkSkeleton();
                    ItemDetailsService.setData(item);
                    // Buildfire.history.push(WidgetHome.items[index].title, {});
                    if (pushToHistory) {
                        Buildfire.history.push(item.title, {});
                    }
                    trackAnalyticsActions.isItemPlayed = null;
                    trackAnalyticsActions.analyticsTrackingInterval = null;
                    trackAnalyticsActions.lastAnalyticsTime = null;
                    Location.goTo('#/item');
                };

                WidgetHome.bookmark = function ($event, item) {
                    $event.stopImmediatePropagation();
                    var isBookmarked = item.bookmarked ? true : false;
                    if (isBookmarked) {
                        bookmarks.delete($scope, item);
                    } else {
                        bookmarks.add($scope, item);
                    }
                };

                WidgetHome.share = function ($event, item) {
                    $event.stopImmediatePropagation();

                    ItemDetailsService.share(item);
                };

                var initAuthUpdate = function () {
                    Buildfire.auth.onLogin(function () {
                        WidgetHome.initializePlugin();
                    }, true);

                    Buildfire.auth.onLogout(function () {
                        WidgetHome.initializePlugin();
                    }, true);
                };

                /**
                 * @name WidgetHome.loadMore() function
                 * will used to load more items on scroll to implement lazy loading
                 */
                WidgetHome.loadMore = function () {
                    if (WidgetHome.busy || totalChunks === 0) {
                        return;
                    }
                    WidgetHome.busy = true;
                    if (nextChunkDataIndex < totalChunks) {
                        nextChunk = chunkData[nextChunkDataIndex];
                        WidgetHome.items.push.apply(WidgetHome.items, nextChunk);
                        nextChunkDataIndex = nextChunkDataIndex + 1;
                        nextChunk = null;
                        bookmarks.sync($scope);
                        viewedItems.sync($scope.WidgetHome.items);
                    }
                    WidgetHome.busy = false;
                    if (!$scope.$$phase) $scope.$digest();
                };

                /**
                 * will called when controller scope has been destroyed.
                 */
                $scope.$on("$destroy", function () {
                    DataStore.clearListener();
                });

                $rootScope.$on("ROUTE_CHANGED", function (e, itemListLayout) {
                    initAuthUpdate();
                    if (!WidgetHome.data.design) {
                        WidgetHome.data.design = {};
                    }
                    WidgetHome.data.design.itemListLayout = itemListLayout;
                    DataStore.onUpdate().then(null, null, onUpdateCallback);
                });

                $rootScope.$on("Carousel:LOADED", function () {
                    WidgetHome.view = null;
                    if (!WidgetHome.view) {
                        WidgetHome.view = new Buildfire.components.carousel.view("#carousel", [], "WideScreen", null, true);
                    }
                    if (WidgetHome.data && WidgetHome.data.content.carouselImages) {
                        //                        WidgetHome.view = new Buildfire.components.carousel.view("#carousel", WidgetHome.data.content.carouselImages);
                        WidgetHome.view.loadItems(WidgetHome.data.content.carouselImages, null, 'WideScreen');
                    } else {
                        WidgetHome.view.loadItems([]);
                    }
                });

                initAuthUpdate();
                /**
                 * Implementation of pull down to refresh
                 */
                var onRefresh = Buildfire.datastore.onRefresh(function () {
                    Buildfire.history.pop();
                    Location.goToHome();
                });

            }
        ]);
})(window.angular);
