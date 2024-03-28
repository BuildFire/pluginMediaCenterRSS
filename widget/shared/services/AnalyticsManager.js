class AnalyticsManager {
    static _batchSize = 25;

    static trackAction(eventName, data) {
        buildfire.analytics.trackAction(eventName, data);
    }

    static registerFeedAnalytics(startIndex = 0, feedData, callback) {
        const registeringArray = [];
        const batch = feedData.slice(startIndex, startIndex + this._batchSize);
        batch.forEach(item => {
            if (item.type === "VIDEO" || item.type === 'AUDIO') {
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Plays Count`, `${item.guid}_plays`, 'Tracks the total number of times this item has been played by users within the app. It provides insights into the overall engagement level and popularity of this item.'));
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Opens Count`, `${item.guid}_opens`, 'Tracks the total number of times this item has been opened by users within the app. It provides insights into the overall engagement level and popularity of this item.'));
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Watch Time Duration`, `${item.guid}_SecondsWatch`, 'This analytics metric calculates the cumulative watch time for the item content. It offers valuable insights into user engagement and content consumption habits, aiding in content optimization and audience targeting strategies.'));
            } else {
                registeringArray.push(AnalyticsManager.registerEvent(`${item.title} - Opens Count`, `${item.guid}_opens`, 'Tracks the total number of times this item has been opened by users within the app. It provides insights into the overall engagement level and popularity of this item.'));
            }
        });

        Promise.all(registeringArray)
            .then(() => {
                if (startIndex + this._batchSize < feedData.length) {
                    this.registerFeedAnalytics(startIndex + this._batchSize, feedData, callback);
                } else {
                    callback();
                }
            })
            .catch(err => {
                callback(err)
            });
    }
    
    static unRegisterFeedAnalytics(startIndex = 0, feedData, callback) {
        const unRegisteringArray = [];
        const batch = feedData.slice(startIndex, startIndex + this._batchSize);
        batch.forEach(item => {
            if (item.type === "VIDEO" || item.type === 'AUDIO') {
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_plays`));
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_opens`));
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_SecondsWatch`));
            } else {
                unRegisteringArray.push(AnalyticsManager.unregisterEvent(`${item.guid}_opens`));
            }
        });

        Promise.all(unRegisteringArray)
            .then(() => {
                if (startIndex + this._batchSize < feedData.length) {
                    this.unRegisterFeedAnalytics(startIndex + this._batchSize, feedData, callback);
                } else {
                    callback();
                }
            })
            .catch(err => {
                callback(err)
            });
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

    static trackEvent(eventKey, metaData) {
        buildfire.analytics.trackAction(eventKey, metaData);
    }

    static init() { // this should be called one time 
        AnalyticsManager.registerEvent(`Videos Opens Count`, `videoOpens`, 'Tracks the total number of times all videos have been opened by users within the app. It provides insights into the overall engagement level and popularity of all videos.');
        AnalyticsManager.registerEvent(`Videos Plays Count`, `videoPlays`, 'Tracks the total number of times all videos have been played by users within the app. It provides insights into the overall engagement level and popularity of all videos.');
        AnalyticsManager.registerEvent(`Audios Opens Count`, `audioOpens`, 'Tracks the total number of times all audios have been opened by users within the app. It provides insights into the overall engagement level and popularity of all audios.');
        AnalyticsManager.registerEvent(`Audios Plays Count`, `audioPlays`, 'Tracks the total number of times all audios have been played by users within the app. It provides insights into the overall engagement level and popularity of all audios.');
        AnalyticsManager.registerEvent(`Articles Opens Count`, `articleOpens`, 'Tracks the total number of times all articles have been opened by users within the app. It provides insights into the overall engagement level and popularity of all articles.');
    }
}
// analytics will moved to the next sprint 28/03/2024