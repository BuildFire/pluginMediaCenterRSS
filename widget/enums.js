'use strict';

(function (angular) {
  angular.module('mediaCenterRSSPluginWidget')

    /**************
     *    ENUMs   *
     **************/

    /**
     * TAG_NAMES will be used to give an alias name for user's data object for buildfire.datastore CURD operations
     */
    .constant('TAG_NAMES', {
      RSS_FEED_INFO: 'RssFeedInfo'
    })

    /**
     * STATUS_CODE will be used for custom errors
     */
    .constant('STATUS_CODE', {
      UNDEFINED_EVENT: 'UNDEFINED_EVENT'
    })

    /**
     * STATUS_MESSAGES will be used for custom errors
     */
    .constant('STATUS_MESSAGES', {
      UNDEFINED_EVENT: 'Undefined event provided'
    })


    /**
     * MEDIUM_TYPES will be used to filter item whether it have video content, audio content, image content or other.
     */
    .constant('MEDIUM_TYPES', {
      VIDEO: 'VIDEO',
      AUDIO: 'AUDIO',
      IMAGE: 'IMAGE',
      OTHER: 'OTHER'
    })

    .constant('FEED_IMAGES', {
      YES: 'Yes',
      NO: 'No'
    });
})(window.angular);