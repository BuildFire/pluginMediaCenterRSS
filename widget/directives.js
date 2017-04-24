(function (angular, buildfire) {
  angular
    .module('mediaCenterRSSPluginWidget')

  /****************
   *  directives  *
   ****************/

  /**
   * A directive which is used to render ng-repeat when data received.
   */
    .directive("triggerNgRepeatRender", [function () {
      var linker = function (scope, elem, attrs) {
        var a = $(elem).width();
      };
      return {
        restrict: 'A',
        link: linker
      };
    }])
  /**
   * A directive which is used handle background image for layouts.
   */
      .directive('backImg', ["$rootScope", function ($rootScope) {
          return function (scope, element, attrs) {
              attrs.$observe('backImg', function (value) {
                  var img = '';
                  if (value) {
                      buildfire.imageLib.local.cropImage(value, {
                          width: $rootScope.deviceWidth,
                          height: $rootScope.deviceHeight
                      }, function (err, imgUrl) {
                          if(imgUrl) {
                              img = imgUrl;
                              element.attr("style", 'background:url(' + img + ') !important;background-size:cover !important');
                          } else {
                              img = '';
                              element.attr("style", 'background-color:white');
                          }
                          element.css({
                              'background-size': 'cover !important'
                          });
                      });
//                      img = $filter("cropImage")(value, $rootScope.deviceWidth, $rootScope.deviceHeight, true);
                  }
                  else {
                      img = "";
                      element.attr("style", 'background-color:white');
                      element.css({
                          'background-size': 'cover !important'
                      });
                  }
              });
          };
      }])

  /**
   * A directive which is used handle background image for layouts.
   */
    /*.directive("backgroundImage", ['$filter', function ($filter) {
      var linker = function (scope, element, attrs) {
        element.css('min-height', '580px');
        var getImageUrlFilter = $filter("resizeImage");
        var setBackgroundImage = function (backgroundImage) {
          if (backgroundImage) {
            element.css(
              'background', '#010101 url('
              + getImageUrlFilter(backgroundImage, 342, 770, 'resize')
              + ') repeat fixed top center');
          } else {
            element.css('background', 'none');
          }
        };
        attrs.$observe('backgroundImage', function (newValue) {
          setBackgroundImage(newValue);
        });
      };
      return {
        restrict: 'A',
        link: linker
      };
    }])*/

  /**
   * A directive which is used to initiate carousel when image items received.
   */
      .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
          return {
              restrict: 'A',
              link: function (scope, elem, attrs) {
                  $rootScope.$broadcast("Carousel:LOADED");
              }
          };
      }])
})(window.angular, window.buildfire);
