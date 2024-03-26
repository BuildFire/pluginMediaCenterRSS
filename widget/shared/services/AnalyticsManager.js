class AnalyticsManager {
    static trackAction(eventName, data) {
        buildfire.analytics.trackAction(eventName, data);
    }

    static registerFeedAnalytics(feedData, callback) {
        const registeringArray = [];
        feedData.forEach(item => {
            if (item.type === "VIDEO" || item.type === 'AUDIO') {
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Total Plays`, `${item.guid}_plays`, 'Number of plays'))
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Total Opens`, `${item.guid}_opens`, 'Number of opens'))
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Total Time Watched`, `${item.guid}_SecondsWatch`, 'Number of plays'))
            } else {
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Total Opens`, `${item.guid}_opens`, 'Number of opens'));
            }
        });

        Promise.all(registeringArray)
            .then(() => callback())
            .catch((err) => callback(err));
    }
    
    static unRegisterFeedAnalytics(feedData, callback) {
        const unRegisteringArray = [];
        feedData.forEach(item => {
            if (item.type === "VIDEO" || item.type === 'AUDIO') {
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_plays`));
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_opens`));
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_SecondsWatch`));
            } else {
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_opens`));
            }
        });

        Promise.all(unRegisteringArray)
            .then(() => callback())
            .catch((err) => callback(err));
    }

    static unregisterEvent(key) {
        return new Promise((resolve, reject) => {
            buildfire.analytics.unregisterEvent(key, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            });
        })
    }
    
    static registerEvent(title, key, description) {
        return new Promise((resolve, reject) => {
            buildfire.analytics.registerEvent({ title, key, description }, { silentNotification: true }, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            });
        })
    }

    static init() { // this should be called one time 
        AnalyticsManager.registerEvent(`Total Video Opens`, `videoOpens`, 'Number of opens');
        AnalyticsManager.registerEvent(`Total Video Plays`, `videoPlays`, 'Number of plays');
        AnalyticsManager.registerEvent(`Total Audio Opens`, `audioOpens`, 'Number of opens');
        AnalyticsManager.registerEvent(`Total Audio Plays`, `audioPlays`, 'Number of plays');
        AnalyticsManager.registerEvent(`Total Articles Opens`, `articleOpens`, 'Number of opens');
    }
}
