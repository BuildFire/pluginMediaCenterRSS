var cache = {
  storeName: "cacheStore",
  platform: window.buildfire.getContext().device.platform,
  instanceId: window.buildfire.getContext().instanceId,
  saveCache: function (object) {
    if (this.platform !== "web") {
      var options = {
        path: "/data/pluginMediaCenterRss/",
        fileName: "cache_" + this.instanceId + ".txt",
        content: JSON.stringify(object),
      };

      window.buildfire.services.fileSystem.fileManager.writeFileAsText(
        options,
        function () {}
      );
    } else {
      window.buildfire.localStorage.setItem(
        this.storeName + "_" + this.instanceId,
        JSON.stringify(object),
        function () {}
      );
    }
  },
  getCache: function (callback) {
    if (this.platform !== "web") {
      var options = {
        path: "/data/pluginMediaCenterRss/",
        fileName: "cache_" + this.instanceId + ".txt",
      };

      window.buildfire.services.fileSystem.fileManager.readFileAsText(
        options,
        function (error, value) {
          if (error) return callback(error, null);
          callback(
            null,
            JSON.parse(typeof value === "undefined" ? null : value)
          );
        }
      );
    } else {
      window.buildfire.localStorage.getItem(
        this.storeName + "_" + window.buildfire.getContext().instanceId,
        function (error, value) {
          if (error) return callback(error, null);
          callback(
            null,
            JSON.parse(typeof value === "undefined" ? null : value)
          );
        }
      );
    }
  },
};
