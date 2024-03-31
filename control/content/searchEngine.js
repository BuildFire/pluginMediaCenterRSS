'use strict';

const searchEngine = {
  insertFeed: function insertFeed(rssFeed, callback) {
    const options = this.getSearchEngineOptions(rssFeed);
    buildfire.services.searchEngine.feeds.insert(options, callback);
  },
  deleteFeed: function deleteFeed(rssFeed, callback) {
    this.get(rssFeed.id, function (err, result) {
      if (err) return callback(err, null);
      if (!result || !result[0] || !result[0]._id) return callback();

      const feedId = result[0]._id;
      const options = {
        tag: `rss_feed_${rssFeed.id}`,
        feedId: feedId,
        removeFeedData: true
      };
      buildfire.services.searchEngine.feeds.delete(options, callback);
    });
  },
  get: function get(feedId, callback) {
    buildfire.services.searchEngine.feeds.get({ tag: `rss_feed_${feedId}`, feedType: 'rss' }, function (err, result) {
      callback(err, result);
    });
  },
  isFeedChanged: function isFeedChanged(rssFeed, callback) {
    this.get(rssFeed.id, function (err, result) {
      if (err) return callback(err, null);
      if (!result || !result[0] || !result[0]._id) return callback(null, true);

      const feedUrl = result[0] ? result[0].feed_config.url : false;
      const feedItemConfig = result[0] ? result[0].feed_item_config : {};
      const { feedItemConfig: currentFeedItemConfig } = searchEngine.getSearchEngineOptions(rssFeed);

      const isFeedItemConfigChanged = utils.checkEquality(feedItemConfig, currentFeedItemConfig);

      const changeState = !feedUrl || feedUrl !== rssFeed.url || isFeedItemConfigChanged;
      return callback(null, changeState);
    });
  },
  getSearchEngineOptions: function getSearchEngineOptions(rssFeed) {
    let feedItemConfig = {
      uniqueKey: "guid",
      titleKey: "title",
      urlKey: "link",
      descriptionKey: "description",
      publishDateKey: "pubDate",
      imageUrlKey: "thumbnail"
    };
    if (rssFeed.advancedConfig && rssFeed.advancedConfig.enableSearchEngineConfig && rssFeed.advancedConfig.searchEngineItemConfig) {
      feedItemConfig = rssFeed.advancedConfig.searchEngineItemConfig;
    }

    let options = {
      tag: `rss_feed_${rssFeed.id}`,
      title: 'rss feed',
      feedType: "rss",
      feedConfig: {
        url: rssFeed.url
      },
      feedItemConfig: feedItemConfig
    };

    return options;
  },
};