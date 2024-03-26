'use strict';

(function (angular, buildfire) {

    // Make sure to include the required dependency to the module
    angular.module('mediaCenterRSSPluginWidget', [
            'ngRoute',
            'infinite-scroll',
            "ngSanitize",
            "com.2fdevs.videogular",
            "com.2fdevs.videogular.plugins.controls",
            "com.2fdevs.videogular.plugins.overlayplay",
            "videosharing-embed",
            "media_RSSModals",
            "ngTouch"
        ])

        .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

            /**
             * To make href urls safe on mobile
             */
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


            /*****************************
             *  Redirects and Otherwise  *
             *****************************/

            // Use $routeProvider to configure any redirects (when) and invalid urls (otherwise).
            $routeProvider
                .when('/', {
                    template: '<div></div>'
                })
                .when('/item', {
                    templateUrl: 'templates/media.html',
                    controllerAs: 'WidgetMedia',
                    controller: 'WidgetMediaCtrl'
                })
                .when('/nowplaying', {
                    templateUrl: 'templates/now-playing.html',
                    controllerAs: 'NowPlaying',
                    controller: 'NowPlayingCtrl'
                })

                // If the url is invalid then redirect to '/'
                .otherwise('/');
        }])
        .run(['Location', '$location', '$rootScope', '$timeout', function (Location, $location, $rootScope, $timeout) {
            buildfire.history.onPop(function () {
                var reg = /^\/item/;
                var reg1 = /^\/nowplaying/;
                if (reg.test($location.path())) {
                    $timeout(function () {
                        $rootScope.showFeed = true;
                    }, 200);
                    Location.goToHome();
                } else if (reg1.test($location.path())) {
                    if ($rootScope.playlist) {
                        $rootScope.playlist = false;
                    } else {
                        $rootScope.showFeed = false;
                        Location.goTo('#/item');
                    }
                }
            });
        }])
        .directive("loadImage", function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    if(attrs.loadImage) {
                        element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");
                    } else {
                        element.attr("src", "");
                    }

                    attrs.$observe('finalSrc', function () {
                        var _img = attrs.finalSrc;

                        if (attrs.cropType == 'resize') {
                            buildfire.imageLib.local.resizeImage(_img, {
                                width: attrs.cropWidth,
                                height: attrs.cropHeight
                            }, function (err, imgUrl) {
                                _img = imgUrl;
                                replaceImg(_img);
                            });
                        } else {
                            buildfire.imageLib.local.cropImage(_img, {
                                width: attrs.cropWidth,
                                height: attrs.cropHeight
                            }, function (err, imgUrl) {
                                _img = imgUrl;
                                replaceImg(_img);
                            });
                        }
                    });

                    function replaceImg(finalSrc) {
                        var elem = $("<img>");
                        elem[0].onload = function () {
                            element.attr("src", finalSrc);
                            elem.remove();
                        };
                        elem.attr("src", finalSrc);
                    }
                }
            };
        })
})(window.angular, window.buildfire);