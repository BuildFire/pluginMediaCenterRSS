const viewedItems = {
	id: '',
	/**
	 * If localStorage is not set, initialize viewed videos as an empty array
	 */
	init() {
		buildfire.auth.getCurrentUser((err, user) => {
			if (err) throw err;

			this.id = user ? user._id : 'guest';

			let viewedItems = JSON.parse(localStorage.getItem('viewedItems'));

			const storageInitialized = viewedItems && typeof viewedItems === 'object' ? true : false;

			if (storageInitialized) {
				const userStateInitialized = viewedItems.hasOwnProperty(this.id);
				if (userStateInitialized) return;
				else viewedItems[this.id] = [];
			} else {
				viewedItems = { [this.id]: [] };
			}

			localStorage.setItem('viewedItems', JSON.stringify(viewedItems));
		});
	},
	/**
	 * returns the current user's parsed array of viewed videos
	 * @returns {Array}
	 */
	get() {
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
	_set(items) {
		try {
			let viewedItems = JSON.parse(localStorage.getItem('viewedItems'));
			viewedItems[this.id] = items;
			localStorage.setItem('viewedItems', JSON.stringify(viewedItems));
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
	markViewed($scope, id) {
		const viewedItems = this.get();
		const isViewed = viewedItems.includes(id);

		if (isViewed) return;

		viewedItems.push(id);
		this._set(viewedItems);

		$scope.WidgetHome.items.map(item => {
			if (viewedItems.includes(item.link)) {
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
	sync(items) {
		return items.map(item => {
			const isViewed = this.get().includes(item.link);
			item.viewed = isViewed ? true : false;
		});
	}
};