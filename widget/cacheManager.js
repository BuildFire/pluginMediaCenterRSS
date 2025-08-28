let cacheManager = {
    platform: buildfire.getContext().device.platform,
    instanceId: buildfire.getContext().instanceId.replace("-", ""),
    indexDb: null,
    fsFileName: 'userItemsData.txt',
	writeInProgress: false,
    storedData: {},
    setItem: function (key, data, callback) {
        key = String(key).replace(/\W/g, "");
        if (this.platform === "web") {
            let _this = this;
            this.initIndexDb(key, function () {
                _this.saveWeb(key, data, callback);
            });
        } else {
            this.saveMobile(key, data, callback);
        }
    },
    getItem: function (key) {
        return new Promise((resolve, reject) => {
            key = String(key).replace(/\W/g, "");
            if (this.platform === "web") {
                let _this = this;
                this.initIndexDb(key, function () {
                    _this.getWeb(key, function (err, result) {
                        if (err) return reject(err);
                        if (result) resolve(result);
                        else resolve();
                    });
                });
            } else {
                this.getMobile(key, function (err, result) {
                    if (err) return resolve({});
                    if (result) resolve(result);
                    else resolve();
                });
            }
        });
    },
    deleteItem: function (key, callback) {
        key = String(key).replace(/\W/g, "");
        if (this.platform === "web") {
            let _this = this;
            this.initIndexDb(key, function () {
                _this.deleteWeb(key, callback);
            });
        } else {
            this.deleteMobile(key, callback);
        }
    },
    initIndexDb: function (key, callback) {
        let options = {};
        if (key == 'undefined') {
            options = {
                dbName: "rss.cache",
                indexName: "feed",
                objectStoreName: "feed.cache",
            };
        } else {
            options = {
                dbName: `key_${this.instanceId}.${key}.cache`,
                indexName: `key_${key}`,
                objectStoreName: `key_${key}.cache`,
            };
        }

        const request = window.indexedDB.open(options.dbName, key == 'undefined' ? 3 : 1);

        let _this = this;

        request.onerror = function (event) {
            console.error("Error initialising indexedDB", event);
        };

        request.onupgradeneeded = function (event) {
            _this.indexDb = event.target.result;
            const objectStore = _this.indexDb.createObjectStore(
                options.objectStoreName
            );
            objectStore.createIndex(options.indexName, options.indexName, {
                unique: false,
            });
        };

        request.onsuccess = function () {
            _this.indexDb = request.result;
            callback(null);
        };
    },
    saveWeb: function (key, data, callback) {
        if (!this.indexDb)
            return console.error(
                "Error saving cache: db ref not found. Make sure to run initIndexDb first!"
            );

        if (!callback)
            callback = function () {
            };

        const objectStoreName = key == 'undefined' ? "feed.cache" : `key_${key}.cache`;
        const cacheTransaction = this.indexDb.transaction(
            objectStoreName,
            "readwrite"
        );
        const cacheObjStore = cacheTransaction.objectStore(objectStoreName);
        const request = cacheObjStore.put(data, key == 'undefined' ? "feed" : key);

        request.onerror = function (err) {
            callback(err);
        };
        request.onsuccess = function () {
            callback(null);
        };
    },
    getWeb: function (key, callback) {
        if (!this.indexDb)
            return callback(
                "Error getting cache: db ref not found. Make sure to run initIndexDb first!"
            );
        const objectStoreName = key == 'undefined' ? "feed.cache" : `key_${key}.cache`;
        try {
            const cacheTransaction = this.indexDb.transaction(
                objectStoreName,
                "readwrite"
            );
            const cacheObjStore = cacheTransaction.objectStore(objectStoreName);
            const request = cacheObjStore.get(key == 'undefined' ? "feed" : key);
            request.onsuccess = function (event) {
                callback(null, event.target.result);
            };
        } catch (error) {
            // Key not set yet
            return callback(null, null);
        }
    },
    deleteWeb: function (key, callback) {
        if (!this.indexDb)
            return callback(
                "Error getting cache: db ref not found. Make sure to run initIndexDb first!"
            );
        const objectStoreName = key == 'undefined' ? "feed.cache" : `key_${key}.cache`;
        try {
            const cacheTransaction = this.indexDb.transaction(
                objectStoreName,
                "readwrite"
            );
            const cacheObjStore = cacheTransaction.objectStore(objectStoreName);
            const request = cacheObjStore.delete(key == 'undefined' ? "feed" : key);
            request.onsuccess = function (event) {
                callback(null, event.target.result);
            };
        } catch (error) {
            // Key not set yet
            return callback(null, null);
        }
    },
    saveMobile: function (key, data, callback) {
        if (!callback)
            callback = function () { };

        let options = {};
        if (key == 'undefined') {
            options = {
                path: "/data/pluginMediaCenterRss/",
                fileName: "cache_" + this.instanceId + ".txt",
                content: JSON.stringify(data),
            }
        } else {
            options = {
                path: `/data/${this.instanceId}/`,
                fileName: `cache_${key}.txt`,
                content: JSON.stringify(data),
            };
        }

        buildfire.services.fileSystem.fileManager.writeFileAsText(options, callback);
    },
    getMobile: function (key, callback) {
        let options = {};

        if (key == 'undefined') {
            options = {
                path: "/data/pluginMediaCenterRss/",
                fileName: "cache_" + this.instanceId + ".txt",
            }
        } else {
            options = {
                path: `/data/${this.instanceId}/`,
                fileName: `cache_${key}.txt`,
            };
        }
        function fileRead(err, data) {
            if (err || !data || data == undefined || data == "undefined")  return callback(err, null);
            return callback(null, JSON.parse(data));
        }

        buildfire.services.fileSystem.fileManager.readFileAsText(options, fileRead);
    },
    deleteMobile: function (key, callback) {
        const options = {
            path: `/data/${this.instanceId}/`,
            fileName: `cache_${key}.txt`,
        };

        buildfire.services.fileSystem.fileManager.deleteFile(options, callback);
    },
    migrateToFS: function (options) {
        const {key, oldKey, path} = options;
        return new Promise((resolve) => {
            const item = buildfire.localStorage.getItem(oldKey ? oldKey : key);
            if (!item) return resolve();

            let parsed;
            try {
                parsed = JSON.parse(item);
            } catch (e) {
                console.warn(e);
                buildfire.localStorage.removeItem(oldKey ? oldKey : key);
                return resolve();
            }

            if (this.platform === 'web') {
                if (oldKey) {
                    buildfire.localStorage.removeItem(oldKey);
                    return this.write(key, parsed).then(() => resolve());
                }
                return resolve();
            }

            this.write(key, parsed, path).then(() => {
                buildfire.localStorage.removeItem(oldKey ? oldKey : key);
                resolve();
            });
        });
    },
    read: function (key, path) {
        return new Promise((resolve) => {
            if (this.storedData[key]) return resolve(this.storedData[key]);

            if (this.platform === 'web') {
                let item = buildfire.localStorage.getItem(key);
                if (!item) return resolve(null);
                try {
                    return resolve(JSON.parse(item));
                } catch (e) {
                    console.warn(e);
                    return resolve(null);
                }
            } else {
                const options = {
                    path: path || '/data/pluginMediaCenterRss/',
                    fileName: this.fsFileName
                };
                buildfire.services.fileSystem.fileManager.readFileAsText(options, function (err, data) {
                    if (err || !data) return resolve(null);
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed && Object.prototype.hasOwnProperty.call(parsed, key) ? parsed[key] : null);
                    } catch (e) {
                        console.warn(e);
                        resolve(null);
                    }
                });
            }
        });
    },
    write: function (key, data, path) {
		const _this = this;
        return new Promise((resolve) => {
			if (_this.writeInProgress) return resolve();
			_this.writeInProgress = true;

            _this.storedData[key] = data;
            if (_this.platform === 'web') {
                const content = JSON.stringify(data);
                buildfire.localStorage.setItem(key, content);

				_this.writeInProgress = false;
                return resolve();
            }

            const options = {
                path: path || '/data/pluginMediaCenterRss/',
                fileName: _this.fsFileName
            };

            buildfire.services.fileSystem.fileManager.readFileAsText(options, (err, fileData) => {
                let stored = {};
                if (!err && fileData) {
                    try {
                        stored = JSON.parse(fileData) || {};
                    } catch (e) {
                        console.warn(e);
                    }
                }

                stored[key] = data;

                const writeOptions = {
                    path: options.path,
                    fileName: options.fileName,
                    content: JSON.stringify(stored)
                };

                buildfire.services.fileSystem.fileManager.writeFileAsText(writeOptions, function (err, res) {
					_this.writeInProgress = false;
                    resolve();
                });
            });
        });
    },
};
