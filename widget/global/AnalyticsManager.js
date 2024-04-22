class AnalyticsManager {
  // register feed data when adding new feed URL
  static registerFeedAnalytics(feedData, callback) {
    const registeringArray = [];
    feedData.items.forEach(item => {
      registeringArray.push({
        title: `${item.title} - Opens Count`,
        key: '${item.id}_opensCount',
        description: 'event description is mentioned in table below',
      });
      if (item.type === 'video' || item.type === 'audio') {
        registeringArray.push({
          title: `${item.title} - Total Watch Duration`,
          key: '${item.id}_secondsWatch',
          description: 'event description is mentioned in table below'
        });
        registeringArray.push({
          title: `${item.title} - Plays Count`,
          key: '${item.id}_playsCount',
          description: 'event description is mentioned in table below'
        });
      }
    });
    buildfire.analytics.bulkRegisterEvents(registeringArray, { silentNotification: true }, callback);
  }

  // unregister feed data when deleting feed URL
  static unRegisterFeedAnalytics(feedData, callback) {
    const unregisterArray = [];
    feedData.items.forEach(item => {
      unregisterArray.push('${item.id}_opensCount');
      if (item.type === 'video' || item.type === 'audio') {
        unregisterArray.push('${item.id}_secondsWatch');
        unregisterArray.push('${item.id}_playsCount');
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
