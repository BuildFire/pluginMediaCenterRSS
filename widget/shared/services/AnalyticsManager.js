class AnalyticsManager {
    static trackAction(eventName, data) {
        buildfire.analytics.trackAction(eventName, data);
    }

    static registerFeedAnalytics(feedData, callback) {
        const registeringArray = [];
        feedData.forEach(item => {
            if (item.type === 'video' || item.type === 'audio') {
                registeringArray.push(() => {
                    AnalyticsManager.registerEvent(`${item.title} - Total Plays`, `${item.guid}_plays`, 'Number of plays');
                    AnalyticsManager.registerEvent(`${item.title} - Total Opens`, `${item.guid}_opens`, 'Number of opens');
                    AnalyticsManager.registerEvent(`${item.title} - Total Time Watched`, `${item.guid}_SecondsWatch`, 'Number of plays');
                });
            } else {
                AnalyticsManager.registerEvent(`${item.title} - Total Opens`, `${item.guid}_opens`, 'Number of opens');
            }
        });

        Promise.all(registeringArray)
            .then(callback)
            .catch((err) => callback(err));
    }

    static registerEvent(title, key, description) {
        buildfire.analytics.registerEvent({ title, key, description }, { silentNotification: true });
    }

    static init() { // this should be called one time 
        AnalyticsManager.registerEvent(`Total Video Opens`, `videoOpens`, 'Number of opens');
        AnalyticsManager.registerEvent(`Total Video Plays`, `videoPlays`, 'Number of plays');
        AnalyticsManager.registerEvent(`Total Audio Opens`, `audioOpens`, 'Number of opens');
        AnalyticsManager.registerEvent(`Total Audio Plays`, `audioPlays`, 'Number of plays');
        AnalyticsManager.registerEvent(`Total Articles Opens`, `articleOpens`, 'Number of opens');
    }
}
