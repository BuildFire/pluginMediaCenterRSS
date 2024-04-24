const utils = {
    isItemPlayed: null,
    analyticsTrackingInterval: null,
    lastAnalyticsTime: null,

    trackOpenedItem(item) {
        if (!state.openedItems.includes(item.guid)) {
            state.openedItems.push(item.guid);
            const metaData = {
                itemId: item.guid,
                itemTitle: item.title,
                imageUrl: item.imageSrcUrl,
            };
            AnalyticsManager.trackEvent(`${item.guid}_opensCount`, metaData);
            switch (item.type) {
                case 'video':
                    AnalyticsManager.trackEvent('videoOpensCount', metaData);
                    break;
                case 'audio':
                    AnalyticsManager.trackEvent('audioOpensCount', metaData);
                    break;
                default:
                    AnalyticsManager.trackEvent('articleOpensCount', metaData);
                    break;
            }
        }
    },

    trackItemWatchState(options) {
        const { state, currentTime, item, itemType } = options;

        const metaData = {
            itemId: item.guid,
            itemTitle: item.title,
            imageUrl: item.imageSrcUrl,
        };
        const eventKey = `${item.guid}_secondsWatch`; 
        if (state === 'play') {
            if (!utils.isItemPlayed) {
                utils.isItemPlayed = true;
                AnalyticsManager.trackEvent(`${item.guid}_playsCount`, metaData);
                if (itemType === 'video') {
                    AnalyticsManager.trackEvent(`videoPlaysCount`, metaData);
                } else {
                    AnalyticsManager.trackEvent(`audioPlaysCount`, metaData);
                }
            }
            
            if (!utils.analyticsTrackingInterval) {
                utils.analyticsTrackingInterval = setInterval(() => {
                    utils.lastAnalyticsTime += 5;
                    metaData._buildfire = { aggregationValue: 5 }; // 5 seconds
                    AnalyticsManager.trackEvent(eventKey, metaData);
                }, 5 * 1000);
            }
        } else if (state === 'pause') {
            if (utils.analyticsTrackingInterval) {
                clearInterval(utils.analyticsTrackingInterval);
                utils.analyticsTrackingInterval = null;
                const extraTime = currentTime - utils.lastAnalyticsTime;
                utils.lastAnalyticsTime += extraTime;
                metaData._buildfire = { aggregationValue: parseInt(extraTime) };
                AnalyticsManager.trackEvent(eventKey, metaData);
            }
        }
    },

    /**
     * @name getImageUrl()
     * Used to extract image url
     * @param item
     * @returns {*}
     */
    getImageUrl(item, $filter) {
        var i = 0,
            length = 0,
            imageUrl = '';
        if (item.image && item.image.url) {
            imageUrl = item.image.url;
        } else if (item.enclosures && item.enclosures.length > 0) {
            length = item.enclosures.length;
            for (i = 0; i < length; i++) {
                if (item.enclosures[i].type.indexOf('image') === 0 || item.enclosures[i].type.indexOf('img') != -1) {
                    imageUrl = item.enclosures[i].url;
                    break;
                }
            }
        }
        if (imageUrl) {
            return imageUrl;
        }
        else {
            if (item['media:thumbnail'] && item['media:thumbnail']['@'] && item['media:thumbnail']['@'].url) {
                return item['media:thumbnail']['@'].url;
            } else if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content']['media:thumbnail'] && item['media:group']['media:content']['media:thumbnail']['@'] && item['media:group']['media:content']['media:thumbnail']['@'].url) {
                return item['media:group']['media:content']['media:thumbnail']['@'].url;
            } else if (item.description) {
                return $filter('extractImgSrc')(item.description);
            } else {
                return '';
            }
        }
    }
}