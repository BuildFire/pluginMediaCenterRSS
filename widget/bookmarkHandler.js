const bookmarks = {
	add($scope, item) {
		let options = {
			id: item.link,
			title: item.title,
			payload: item,
			icon: item.imageSrcUrl
		};
		let callback = (err, data) => {
            if (err) throw err;
            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(i => {
                    const isBookmarked = i.link === item.link;
                    if (isBookmarked) {
                        i.bookmarked = true;
                    }
                });
            } else if ($scope.WidgetMedia) {
                $scope.WidgetMedia.item.bookmarked = true;
            }
			if (!$scope.$$phase) {
                $scope.$apply();
            } 

		};
		buildfire.bookmarks.add(options, callback);
    },
    delete($scope, item) {
        const callback = () => {
            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(i => {
                    const isBookmarked = i.link === item.link;
                    if (isBookmarked) {
                        i.bookmarked = false;
                    }
                });
            } else if ($scope.WidgetMedia) {
                $scope.WidgetMedia.item.bookmarked = false;
            }
			if (!$scope.$$phase) {
                $scope.$apply();
            } 

        };
        buildfire.bookmarks.delete(item.link, callback);
    },
    _getAll(callback) {
        const cb = (err, bookmarks) => {
            if (err) throw err;
            callback(bookmarks);
        };
        buildfire.bookmarks.getAll(cb);
    },
    findAndMarkAll($scope) {
        this._getAll(bookmarks => {
            console.log(bookmarks);
            
            const bookmarkIds = [];
            bookmarks.forEach(bookmark => {
                bookmarkIds.push(bookmark.id);
            });
            $scope.WidgetHome.items.map(item => {
                const isBookmarked = bookmarkIds.includes(item.link);
                if (isBookmarked) {
                    item.bookmarked = true;
                } else {
                    item.bookmarked = false;
                }
            });
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
        
    }
};
