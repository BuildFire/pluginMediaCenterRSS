'use strict';

const searchEngine = {
  insertFeed(rssFeed, callback) {
    const options = this.getSearchEngineOptions(rssFeed);
    buildfire.services.searchEngine.feeds.insert(options, callback);
  },
  deleteFeed(rssFeedId, callback) {
    this.get(rssFeedId, function (err, result) {
      if (err) return callback(err, null);
      if (!result || !result[0] || !result[0]._id) return callback();

      const feedId = result[0]._id;
      const options = {
        tag: `rss_feed_${rssFeedId}`,
        feedId: feedId,
        removeFeedData: true
      };
      buildfire.services.searchEngine.feeds.delete(options, callback);
    });
  },
  get(feedId, callback) {
    buildfire.services.searchEngine.feeds.get({ tag: `rss_feed_${feedId}`, feedType: 'rss' }, function (err, result) {
      callback(err, result);
    });
  },
  hasFeedConfigChanged(rssFeed, callback) {
    this.get(rssFeed.id, function (err, result) {
      if (err) return callback(err, null);
      if (!result || !result[0] || !result[0]._id) return callback(null, true);

      const feedUrl = result[0] ? result[0].feed_config.url : false;
      const feedItemConfig = result[0] ? result[0].feed_item_config : {};
      const { feedItemConfig: currentFeedItemConfig } = searchEngine.getSearchEngineOptions(rssFeed);

      let isFeedItemConfigChanged = false,
          currentConfigValues = Object.values(currentFeedItemConfig),
          feedConfigValues = Object.values(feedItemConfig);

      for (let i = 0; i < currentConfigValues.length; i++) {
        if (feedConfigValues.indexOf(currentConfigValues[i]) === -1) {
          isFeedItemConfigChanged = true;
          break;
        }
      }

      const changeState = !feedUrl || feedUrl !== rssFeed.url || isFeedItemConfigChanged;
      return callback(null, changeState);
    });
  },
  getSearchEngineOptions(rssFeed) {
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
  getIndexedFeedData(feedTag, callback) {
    this.getIndexedFeedPage({page: 0, pageSize: 2500, feedTag}, [], callback);
  },
  
  getIndexedFeedPage(options, hits, callback) {
    const {page, pageSize, feedTag} = options;
    buildfire.services.searchEngine.search({ tag: feedTag, pageSize, page},
    (err, res) => {
      if (err) return callback(err);

      hits = hits.concat(res.hits.hits);
      if (res && res.total > ((page+1)*pageSize)) {
        options.page += 1;
        return this.getIndexedFeedPage(options, hits, callback);
      }
      return callback(null, hits);
    });
  },

  updateFeedRecords(records, callback) {
    if (!records.length) return callback();

    const batchSize = 10;
    const batch = records.splice(0, batchSize);

    const promises = batch.map(_record => 
      new Promise((resolve, reject) => 
        buildfire.services.searchEngine.update(
          {
            id: _record._id,
            title: _record._source.data.title,
            tag: _record._source.tag,
            description: _record._source.searchable.description,
            keywords: _record._source.searchable.keywords,
            imageUrl: _record._source.image_url,
            data: {
              ..._record._source.data,
              registeredToAnalytics: true,
              type: _record.type,
              src: _record.src
            }
          },
          (err, result) => {
            if (err) return reject(err);
            else resolve();
          }))
      );
    
    Promise.allSettled(promises).then(() => this.updateFeedRecords(records, callback));
  },
};