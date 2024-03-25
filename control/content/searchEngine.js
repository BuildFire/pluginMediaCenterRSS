'use strict';

var searchEngine = {
  indexFeed: function indexFeed(rssFeed, callback) {
    this.get(rssFeed.id, (err, result) => {
      if (err) callback(err, null);

      var feedUrl = result[0] ? result[0].feed_config.url : false;
      if (!feedUrl) {
        this.insertFeed(rssFeed, callback);
      } else if (feedUrl !== rssFeed.url) { // TODO: need to be checked
        this.updateFeed(rssFeed, callback);
        return;
      } else {
        callback('Feed already exists', null);
      }
    });
  },
  deleteFeed: function deleteFeed(rssFeed, callback) {
    this.get(rssFeed.id, function (err, result) {
      if (err) return callback(err, null);
      if (!result || !result[0] || !result[0]._id) return callback();

      var feedId = result[0]._id;
      var options = {
        tag: `rss_feed_${rssFeed.id}`,
        feedId: feedId,
        removeFeedData: true
      };
      buildfire.services.searchEngine.feeds.delete(options, callback);
    });
  },
  insertFeed: function insertFeed(rssFeed, callback) {
    var options = this.getSearchEngineOptions(rssFeed);
    buildfire.services.searchEngine.feeds.insert(options, callback);
  },
  updateFeed: function updateFeed(rssFeed, callback) {
    this.deleteFeed(rssFeed, (err, result) => {
      if (err) return callback(err, null);
      this.insertFeed(rssFeed, callback);
    });
  },
  get: function get(feedId, callback) {
    buildfire.services.searchEngine.feeds.get({ tag: `rss_feed_${feedId}`, feedType: 'rss' }, function (err, result) {
      callback(err, result);
    });
  },
  getSearchEngineOptions: function getSearchEngineOptions(rssFeed) {
    let feedItemConfig = {
      uniqueKey: "guid",
      titleKey: "title",
      urlKey: "link",
      descriptionKey: "media:group.media:keywords",
      publishDateKey: "pubDate",
      imageUrlKey: "media:group.media:thumbnail.$.url"
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