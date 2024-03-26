
class RssFeed {
    constructor(data = {}) {
        this.type = "rss";
        this.subtitle = "RSS Feed";
        this.id = data.id || "";
        this.title = data.title || "";
        this.url = data.url || "";

        this.advancedConfig = this.setupSettings(data.advancedConfig ? data.advancedConfig : {});
    }

    setupSettings(settings = {}) {
        if (!settings.searchEngineItemConfig) {
            settings.searchEngineItemConfig = {};
        }
        return {
            enableSearchEngineConfig: typeof settings.enableSearchEngineConfig === 'boolean' ? settings.enableSearchEngineConfig : false,
            searchEngineItemConfig: {
                uniqueKey: typeof settings.searchEngineItemConfig.uniqueKey !== 'undefined' ? settings.searchEngineItemConfig.uniqueKey : "guid",
                titleKey: typeof settings.searchEngineItemConfig.titleKey !== 'undefined' ? settings.searchEngineItemConfig.titleKey : "title",
                urlKey: typeof settings.searchEngineItemConfig.urlKey !== 'undefined' ? settings.searchEngineItemConfig.urlKey : "link",
                descriptionKey: typeof settings.searchEngineItemConfig.descriptionKey !== 'undefined' ? settings.searchEngineItemConfig.descriptionKey : "description",
                publishDateKey: typeof settings.searchEngineItemConfig.publishDateKey !== 'undefined' ? settings.searchEngineItemConfig.publishDateKey : "pubDate",
                imageUrlKey: typeof settings.searchEngineItemConfig.imageUrlKey !== 'undefined' ? settings.searchEngineItemConfig.imageUrlKey : "thumbnail"
            }
        }
    }
}