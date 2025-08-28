let viewedItems = {
    id: '',
    data: {},
    init: function () {
        let _this = this;
        buildfire.auth.getCurrentUser(function (err, user) {
            if (err) throw err;
            _this.id = user ? user._id : 'guest';
            let key = `viewedItems_${storageUtil.instanceId}`;
            storageUtil.migrateToFS(key, '/data/pluginMediaCenterRss/').then(function () {
                storageUtil.read(key, '/data/pluginMediaCenterRss/').then(function (stored) {
                    if (!stored || typeof stored !== 'object') stored = {};
                    if (!stored[_this.id]) stored[_this.id] = [];
                    _this.data = stored;
                    return storageUtil.write(key, _this.data, '/data/pluginMediaCenterRss/');
                });
            });
        });
    },
    get: function () {
        if (this.data && this.data[this.id]) return this.data[this.id];
        return [];
    },
    _set: function (items) {
        this.data[this.id] = items;
        storageUtil.write(`viewedItems_${storageUtil.instanceId}`, this.data, '/data/pluginMediaCenterRss/');
    },
    markViewed: function ($scope, id) {
        let viewed = this.get();
        if (viewed.includes(id)) return;
        viewed.push(id);
        this._set(viewed);
        $scope.WidgetHome.items.map(function (item) {
            if (viewed.includes(item.guid)) {
                item.viewed = true;
            }
        });
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    },
    sync: function (items) {
        let _this = this;
        return items.map(function (item) {
            item.viewed = _this.get().includes(item.guid);
            return item;
        });
    }
};
