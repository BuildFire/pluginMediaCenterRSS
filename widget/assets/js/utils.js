const utils = {
    openedItems: [],

    isItemPlayed: null,
    analyticsTrackingInterval: null,
    lastAnalyticsTime: null,

    trackOpenedItem: function (item) {
        if (!utils.openedItems.includes(item.guid)) {
            utils.openedItems.push(item.guid);
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

    trackItemWatchState: function (options) {
        const {state, currentTime, item, itemType} = options;

        const metaData = {
            itemId: item.guid,
            itemTitle: item.title,
            imageUrl: item.imageSrcUrl,
        };
        const eventKey = `${item.guid}_SecondsWatch`; 
        if (state === 'play') {
            if (!utils.isItemPlayed) {
                utils.isItemPlayed = true;
                AnalyticsManager.trackEvent(`${item.guid}_PlaysCount`, metaData);
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
                }, 5*1000);
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

}