'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var viewedItems = {
	id: '',
	/**
  * If localStorage is not set, initialize viewed videos as an empty array
  */
	init: function init() {
		var _this = this;

		buildfire.auth.getCurrentUser(function (err, user) {
			if (err) throw err;

			_this.id = user ? user._id : 'guest';

			var viewedItems = JSON.parse(localStorage.getItem('viewedItems'));

			var storageInitialized = viewedItems && (typeof viewedItems === 'undefined' ? 'undefined' : _typeof(viewedItems)) === 'object' ? true : false;

			if (storageInitialized) {
				var userStateInitialized = viewedItems.hasOwnProperty(_this.id);
				if (userStateInitialized) return;else viewedItems[_this.id] = [];
			} else {
				viewedItems = _defineProperty({}, _this.id, []);
			}

			localStorage.setItem('viewedItems', JSON.stringify(viewedItems));
		});
	},

	/**
  * returns the current user's parsed array of viewed videos
  * @returns {Array}
  */
	get: function get() {
		try {
			return JSON.parse(localStorage.getItem('viewedItems'))[this.id];
		} catch (e) {
			console.warn(e);
			return [];
		}
	},

	/**
  * stringify and set viewed videos to local storage
  * @param {Array} videos
  */
	_set: function _set(items) {
		try {
			var _viewedItems2 = JSON.parse(localStorage.getItem('viewedItems'));
			_viewedItems2[this.id] = items;
			localStorage.setItem('viewedItems', JSON.stringify(_viewedItems2));
		} catch (e) {
			console.warn(e);
			return [];
		}
	},

	/**
  * pushes a video id to local storage
  * marks video as viewed
  * @param {Object} $scope
  * @param {Object} video
  */
	markViewed: function markViewed($scope, id) {
		var viewedItems = this.get();
		var isViewed = viewedItems.includes(id);

		if (isViewed) return;

		viewedItems.push(id);
		this._set(viewedItems);

		$scope.WidgetHome.items.map(function (item) {
			if (viewedItems.includes(item.guid)) {
				item.viewed = true;
			}
		});

		if (!$scope.$$phase) {
			$scope.$apply();
		}
	},

	/**
  * maps through an array of videos
  * marks videos that have been viewed
  * @param {Array} videos
  */
	sync: function sync(items) {
		var _this2 = this;

		return items.map(function (item) {
			var isViewed = _this2.get().includes(item.guid);
			item.viewed = isViewed ? true : false;
		});
	}
};