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
        "ngAnimate",
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
            buildfire.navigation.onBackButtonClick = function () {
                var reg = /^\/item/;
                var reg1 = /^\/nowplaying/;
                if (reg.test($location.path())) {
                    $timeout(function(){
                        $rootScope.showFeed = true;
                    },200);
                    Location.goTo('#/');
                }
                else if (reg1.test($location.path())) {
                    if($rootScope.playlist){
                        $rootScope.playlist=false;
                    }
                    else{
                        $rootScope.showFeed = false;
                        Location.goTo('#/item');
                    }
                }
                else {
                    buildfire.navigation._goBackOne();
                }
            };
            buildfire.device.onAppBackgrounded(function () {
                $rootScope.$emit('deviceLocked', {});
            });
        }])
        /*.filter('getImageUrl', ['Buildfire','$timeout', function (Buildfire, $timeout) {
            filter.$stateful = true;
            var _imgUrl = {};

            function filter(url, width, height, type) {
                if(!_imgUrl.i) {
                    if (type == 'resize') {
                        Buildfire.imageLib.local.resizeImage(url, {
                            width: width,
                            height: height
                        }, function (err, imgUrl) {
                            _imgUrl.i = imgUrl;
                        });
                    } else {
                        *//*Buildfire.imageLib.local.cropImage(url, {
                            width: width,
                            height: height
                        }, function (err, imgUrl) {
                            _imgUrl = imgUrl;
                        });*//*
                        Buildfire.imageLib.local.cropImage(url, {
                            width: width,
                            height: height
                        }, function (err, imgUrl) {
                            _imgUrl = imgUrl;
                        });
                        (function (i, u) {
                            $timeout(function () {
                                i.img = u;
                            }, 2000);
                        })(_imgUrl, url)

                    }
                }
                return _imgUrl.i;
            }
            return filter;
        }])*/
      .directive("loadImage", function () {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {
            element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

              attrs.$observe('finalSrc', function() {
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
      });
})(window.angular, window.buildfire);