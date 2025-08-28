'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	return typeof obj;
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function _defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	} else {
		obj[key] = value;
	}
	return obj;
}

let viewedItems = {
	id: '',
	data: {},
	init: function () {
		return new Promise((resolve, reject) => {
			let _this = this;
			buildfire.auth.getCurrentUser(function (err, user) {
				if (err) reject(err);
				_this.id = user ? user._id : 'guest';
				let key = `viewedItems`;
				cacheManager.migrateToFS({
					key,
				}).then(function () {
					cacheManager.read(key).then(function (stored) {
						if (!stored || typeof stored !== 'object') stored = {};
						if (!stored[_this.id]) stored[_this.id] = [];
						_this.data = stored;
						return resolve();
					});
				});
			});
		})
	},
	get: function () {
		if (this.data && this.data[this.id]) return this.data[this.id];
		return [];
	},
	_set: function (items) {
		this.data[this.id] = items;
		cacheManager.write(`viewedItems`, this.data);
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