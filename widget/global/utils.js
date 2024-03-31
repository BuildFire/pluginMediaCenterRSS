const sharedUtils = {
    /**
     * checkEnclosuresTag()
     * used to check tag eclosures to filter item's media type
     * @param _item
     * @returns {*}
     */
    checkEnclosuresTag: function (_item, MEDIUM_TYPES) {
        let medium = MEDIUM_TYPES.OTHER;
        if (_item.enclosures && _item.enclosures.length > 0 && _item.enclosures[0].url && _item.enclosures[0].type) {
            if (_item.enclosures[0].type.indexOf('video/') === 0) {
                medium = MEDIUM_TYPES.VIDEO;
            } else if (_item.enclosures[0].type.indexOf('audio/') === 0) {
                medium = MEDIUM_TYPES.AUDIO;
            } else if (_item.enclosures[0].type.indexOf('image/') === 0) {
                medium = MEDIUM_TYPES.IMAGE;
            } else {
                medium = MEDIUM_TYPES.OTHER;
            }
            return {
                type: _item.enclosures[0].type,
                src: _item.enclosures[0].url,
                medium: medium
            };
        } else {
            return null;
        }
    },

    /**
     * checkMediaTag()
     * used to check media tag to filter item's media type
     * @param _item
     * @returns {*}
     */
    checkMediaTag: function (_item, MEDIUM_TYPES) {
        let medium = MEDIUM_TYPES.OTHER;

        if (_item['media:group'] && _item['media:group']['media:content']) {
            if (_item['media:group']['media:content']['@'] && _item['media:group']['media:content']['@'].type && _item['media:group']['media:content']['@'].url) {
                if (_item['media:group']['media:content']['@'].type.indexOf('video/') === 0
                    || (_item['media:group']['media:content']['@'].type.indexOf("application/x-shockwave-flash") === 0
                        && _item['media:group']['media:content']['@'].url.indexOf('youtube') > 0)) {

                    medium = MEDIUM_TYPES.VIDEO;
                } else if (_item['media:group']['media:content']['@'].type.indexOf('audio/') === 0) {
                    medium = MEDIUM_TYPES.AUDIO;
                } else if (_item['media:group']['media:content']['@'].type.indexOf('image/') === 0) {
                    medium = MEDIUM_TYPES.IMAGE;
                } else {
                    medium = MEDIUM_TYPES.OTHER;
                }
                return {
                    type: _item['media:group']['media:content']['@'].type,
                    src: _item['media:group']['media:content']['@'].url,
                    medium: medium
                };
            } else if (_item['media:group']['media:content']['media:thumbnail'] && _item['media:group']['media:content']['media:thumbnail']['@'] && _item['media:group']['media:content']['media:thumbnail']['@'].url) {
                medium = MEDIUM_TYPES.IMAGE;
                return {
                    type: 'image/*',
                    src: _item['media:group']['media:content']['media:thumbnail']['@'].url,
                    medium: medium
                };
            } else {
                return null;
            }
        } else if (_item['media:content'] && _item['media:content']['@'] && _item['media:content']['@'].url && _item['media:content']['@'].type) {
            if (_item['media:content']['@'].type.indexOf('video/') === 0) {
                medium = MEDIUM_TYPES.VIDEO;
            } else if (_item['media:content']['@'].type.indexOf('audio/') === 0) {
                medium = MEDIUM_TYPES.AUDIO;
            } else if (_item['media:content']['@'].type.indexOf('image/') === 0) {
                medium = MEDIUM_TYPES.IMAGE;
            } else {
                medium = MEDIUM_TYPES.OTHER;
            }
            return {
                type: _item['media:content']['@'].type,
                src: _item['media:content']['@'].url,
                medium: medium
            };
        } else if (_item['media:content'] && _item['media:content']['media:player'] && _item['media:content']['media:player']['@'] && _item['media:content']['media:player']['@'].url) {
            medium = MEDIUM_TYPES.VIDEO;
            return {
                type: 'video/*',
                src: _item['media:content']['media:player']['@'].url,
                medium: medium
            };
        } else if (_item['media:thumbnail'] && _item['media:thumbnail']['@'] && _item['media:thumbnail']['@'].url) {
            medium = MEDIUM_TYPES.IMAGE;
            return {
                type: 'image/*',
                src: _item['media:thumbnail']['@'].url,
                medium: medium
            };
        } else if (_item.image && _item.image.url) {
            medium = MEDIUM_TYPES.IMAGE;
            return {
                type: 'image/*',
                src: _item.image.url,
                medium: medium
            };
        } else if (_item.imageSrcUrl) {
            medium = MEDIUM_TYPES.IMAGE;
            return {
                type: 'image/*',
                src: _item.imageSrcUrl,
                medium: medium
            };
        } else {
            return null;
        }
    },
}