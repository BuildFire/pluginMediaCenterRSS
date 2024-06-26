class Feed {
    constructor(data = {}) {
        if (data.type === "rss") {
            return new RssFeed(data);
        } else if (data.type === "google") {
            return new GoogleFeed(data);
        }
    }
}

class GoogleFeed {
    constructor(data = {}) {
        this.type = "google";
        this.subtitle = "Google Feed";
        this.id = data.id || "";
        this.title = data.title || "";
        this.keywords = data.keywords || "";
    }
}

class RssFeed {
    constructor(data = {}) {
        this.type = "rss";
        this.subtitle = "RSS Feed";
        this.id = data.id || "";
        this.title = data.title || "";
        this.url = data.url || "";

        this.advancedConfig = new RssAdvancedSettings(data.advancedConfig ? data.advancedConfig : {});
    }
}

class RssAdvancedSettings {
    constructor(settings = {}) {
        if (!settings.searchEngineItemConfig) {
            settings.searchEngineItemConfig = {};
        }
        this.enableFeedAnalytics = typeof settings.enableFeedAnalytics === 'boolean' ? settings.enableFeedAnalytics : false;
        this.enableSearchEngineConfig = typeof settings.enableSearchEngineConfig === 'boolean' ? settings.enableSearchEngineConfig : false;
        this.searchEngineItemConfig = {
            uniqueKey: typeof settings.searchEngineItemConfig.uniqueKey !== 'undefined' ? settings.searchEngineItemConfig.uniqueKey : "guid",
            titleKey: typeof settings.searchEngineItemConfig.titleKey !== 'undefined' ? settings.searchEngineItemConfig.titleKey : "title",
            urlKey: typeof settings.searchEngineItemConfig.urlKey !== 'undefined' ? settings.searchEngineItemConfig.urlKey : "link",
            descriptionKey: typeof settings.searchEngineItemConfig.descriptionKey !== 'undefined' ? settings.searchEngineItemConfig.descriptionKey : "description",
            publishDateKey: typeof settings.searchEngineItemConfig.publishDateKey !== 'undefined' ? settings.searchEngineItemConfig.publishDateKey : "pubDate",
            imageUrlKey: typeof settings.searchEngineItemConfig.imageUrlKey !== 'undefined' ? settings.searchEngineItemConfig.imageUrlKey : "thumbnail"
        }
    }
}