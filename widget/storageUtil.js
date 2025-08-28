let storageUtil = {
    platform: buildfire.getContext().device.platform,
    instanceId: buildfire.getContext().instanceId.replace("-", ""),
    fsFileName: 'storage.txt',
    migrateToFS: function (key, path) {
        return new Promise((resolve) => {
            if (this.platform === 'web') return resolve();

            const item = buildfire.localStorage.getItem(key);
            if (!item) return resolve();

            let parsed;
            try {
                parsed = JSON.parse(item);
            } catch (e) {
                console.warn(e);
                buildfire.localStorage.removeItem(key);
                return resolve();
            }

            this.read(key, path).then((existing) => {
                let dataToWrite;

                if (Array.isArray(parsed) && Array.isArray(existing)) {
                    dataToWrite = existing.concat(parsed.filter(val => !existing.includes(val)));
                } else if (typeof parsed === 'object' && typeof existing === 'object') {
                    dataToWrite = { ...existing };
                    Object.keys(parsed).forEach((k) => {
                        if (Array.isArray(parsed[k]) && Array.isArray(existing[k])) {
                            dataToWrite[k] = existing[k].concat(parsed[k].filter(val => !existing[k].includes(val)));
                        } else {
                            dataToWrite[k] = parsed[k];
                        }
                    });
                } else {
                    dataToWrite = parsed;
                }

                this.write(key, dataToWrite, path).then(() => {
                    buildfire.localStorage.removeItem(key);
                    resolve();
                });
            });
        });
    },
    read: function (key, path) {
        return new Promise((resolve) => {
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
        return new Promise((resolve) => {
            if (this.platform === 'web') {
                const content = JSON.stringify(data);
                buildfire.localStorage.setItem(key, content);
                return resolve();
            }

            const options = {
                path: path || '/data/pluginMediaCenterRss/',
                fileName: this.fsFileName
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

                buildfire.services.fileSystem.fileManager.writeFileAsText(writeOptions, function () {
                    resolve();
                });
            });
        });
    }
};
