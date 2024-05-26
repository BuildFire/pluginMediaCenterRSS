class AnalyticsManager {
  // register feed data when adding new feed URL
  static registerFeedAnalytics(feedData, callback) {
    if (!feedData || !feedData.length) return callback();

    const registeringArray = [];
    feedData.forEach(item => {
      registeringArray.push({
        title: `${item._source.data.title} - Opens Count`,
        key: `${item._source.data.id}_opensCount`,
        description: 'Track how often users open the item, gauging its popularity and engagement.',
      });
      if (item.type === "VIDEO" || item.type === "AUDIO") {
        registeringArray.push({
          title: `${item._source.data.title} - Total Watch Duration`,
          key: `${item._source.data.id}_secondsWatch`,
          description: 'Track total content watch time.'
        });
        registeringArray.push({
          title: `${item._source.data.title} - Plays Count`,
          key: `${item._source.data.id}_playsCount`,
          description: 'Track how often users play the item, gauging its popularity and engagement.'
        });
      }
    });
    buildfire.analytics.bulkRegisterEvents(registeringArray, { silentNotification: true }, callback);
  }

  // unregister feed data when deleting feed URL
  static unRegisterFeedAnalytics(feedData, callback) {
    if (!feedData || !feedData.length) return callback();
    
    const unregisterArray = [];
    feedData.forEach(item => {
      unregisterArray.push(`${item._source.data.id}_opensCount`);
      if (item.type === "VIDEO" || item.type === "AUDIO") {
        unregisterArray.push(`${item._source.data.id}_secondsWatch`);
        unregisterArray.push(`${item._source.data.id}_playsCount`);
      }
    });
    buildfire.analytics.bulkUnregisterEvents(unregisterArray, callback);
  }

  static trackEvent(eventKey, metaData) {
    buildfire.analytics.trackAction(eventKey, metaData);
  }

  static init(callback) { // this should be called one time 
    const registeringArray = [
      {
        title: `Total Video Opens Count`,
        key: 'videoOpensCount',
        description: 'Track all videos opens count in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Audio Opens Count`,
        key: 'audioOpensCount',
        description: 'Track all audios opens count in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Articles Opens Count`,
        key: 'articleOpensCount',
        description: 'Track all articles opens count in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Video Plays Count`,
        key: 'videoPlaysCount',
        description: 'Track total videos plays count in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Audio Plays Count`,
        key: 'audioPlaysCount',
        description: 'Track total audios plays count in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Audio Watch Duration`,
        key: 'audioWatchDuration',
        description: 'Track audios total watch time in the app, offering insights into overall engagement and popularity.',
      },
      {
        title: `Total Video Watch Duration`,
        key: 'videoWatchDuration',
        description: 'Track videos total watch time in the app, offering insights into overall engagement and popularity.',
      },
    ];

    buildfire.analytics.bulkRegisterEvents(registeringArray, { silentNotification: true }, callback);
  }
}
