"use strict";

var bookmarks = {
    add: function add($scope, item) {
        var options = {
            id: item.guid,
            title: item.title,
            payload: {link: item.guid},
            icon: item.imageSrcUrl
        };
        var callback = function callback(err, data) {
            if (err) throw err;
            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(function (i) {
                    var isBookmarked = i.guid === item.guid;
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
    delete: function _delete($scope, item) {
        var callback = function callback() {
            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(function (i) {
                    var isBookmarked = i.guid === item.guid;
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
        buildfire.bookmarks ? buildfire.bookmarks.delete(item.guid, callback) : null;
    },
    _getAll: function _getAll(callback) {
        var cb = function cb(err, bookmarks) {
            if (err) throw err;
            callback(bookmarks);
        };
        buildfire.bookmarks ? buildfire.bookmarks.getAll(cb) : cb(null, []);
    },
    sync: function sync($scope) {
        this._getAll(function (bookmarks) {
            console.log(bookmarks);

            var bookmarkIds = [];
            bookmarks.forEach(function (bookmark) {
                bookmarkIds.push(bookmark.id);
            });

            if ($scope.WidgetHome) {
                $scope.WidgetHome.items.map(function (item) {
                    var isBookmarked = bookmarkIds.includes(item.guid);
                    if (isBookmarked) {
                        item.bookmarked = true;
                    } else {
                        item.bookmarked = false;
                    }
                });
            } else if ($scope.WidgetMedia) {
                var isBookmarked = bookmarkIds.includes($scope.WidgetMedia.item.guid);
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