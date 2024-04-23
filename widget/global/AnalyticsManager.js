class AnalyticsManager {
  // register feed data when adding new feed URL
  static registerFeedAnalytics(feedData, callback) {
    const registeringArray = [];
    feedData.forEach(item => {
      registeringArray.push({
        title: `${item._source.data.title} - Opens Count`,
        key: `${item._source.data.id}_opensCount`,
        description: 'event description is mentioned in table below',
      });
      if (item.type === "VIDEO" || item.type === "AUDIO") {
        registeringArray.push({
          title: `${item._source.data.title} - Total Watch Duration`,
          key: `${item._source.data.id}_secondsWatch`,
          description: 'event description is mentioned in table below'
        });
        registeringArray.push({
          title: `${item._source.data.title} - Plays Count`,
          key: `${item._source.data.id}_playsCount`,
          description: 'event description is mentioned in table below'
        });
      }
    });
    buildfire.analytics.bulkRegisterEvents(registeringArray, { silentNotification: true }, callback);
  }

  // unregister feed data when deleting feed URL
  static unRegisterFeedAnalytics(feedData, callback) {
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
        description: 'Number of opens',
      },
      {
        title: `Total Video Plays Count`,
        key: 'videoPlaysCount',
        description: 'Number of plays',
      },
      {
        title: `Total Audio Opens Count`,
        key: 'audioOpensCount',
        description: 'Number of opens',
      },
      {
        title: `Total Audio Plays Count`,
        key: 'audioPlaysCount',
        description: 'Number of plays',
      },
      {
        title: `Total Articles Opens Count`,
        key: 'articleOpensCount',
        description: 'Number of opens',
      },
    ];

    // bulkRegister is a new method will be added to the sdk
    buildfire.analytics.bulkRegister(registeringArray, callback);
  }
}
