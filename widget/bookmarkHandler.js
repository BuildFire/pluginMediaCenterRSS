const bookmarks = {
	add($scope, item) {
        // let icon = '';
        // if (!item.imageSrcUrl) {
        //     buildfire.pluginInstance.get(window.appContext.currentPlugin.instanceId, (err, data) => {
        //         if (err) {
        //             console.error(err);
        //             return
        //         } else {
        //             icon = data.iconUrl;
        //         }
        //     });
        // } else {
        //     icon = item.imageSrcUrl;
        // };
		let options = {
			id: item.link,
			title: item.title,
			payload: {link: item.link},
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
		buildfire.bookmarks ? buildfire.bookmarks.add(options, callback) : null;
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
        buildfire.bookmarks ? buildfire.bookmarks.delete(item.link, callback) : null;
    },
    _getAll(callback) {
        const cb = (err, bookmarks) => {
            if (err) throw err;
            callback(bookmarks);
        };
        buildfire.bookmarks ? buildfire.bookmarks.getAll(cb) : cb(null, []);
    },
    sync($scope) {
        this._getAll(bookmarks => {
            console.log(bookmarks);
            
            const bookmarkIds = [];
            bookmarks.forEach(bookmark => {
                bookmarkIds.push(bookmark.id);
            });

            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(item => {
                    const isBookmarked = bookmarkIds.includes(item.link);
                    if (isBookmarked) {
                        item.bookmarked = true;
                    } else {
                        item.bookmarked = false;
                    }
                });
            } else if ($scope.WidgetMedia) {
                const isBookmarked = bookmarkIds.includes($scope.WidgetMedia.item.link);
                if (isBookmarked) {
                    $scope.WidgetMedia.item.bookmarked = true;
                } else {
                    $scope.WidgetMedia.item.bookmarked = false;
                }
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
        
    }
};
