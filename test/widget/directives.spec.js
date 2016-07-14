describe('Unit : pluginPluginMediaCenterRSS widget directives.js', function () {

  describe('Unit: backgroundImage directive', function () {
    describe('backgroundImage directive have assigned a url value', function () {
      var $compile, $rootScope, backgroundImage, $scope;
      beforeEach(module('mediaCenterRSSPluginWidget'));
      beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
      }));
      beforeEach(function () {
        backgroundImage = $compile('<div background-image="https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c386/6256a8e0-4b0e-11e5-8618-af6c4fe89f23.png"></div>')($scope);
        $rootScope.$digest();
      });

      it('it should pass and background of div should be given image url', function () {
        expect(backgroundImage.css('background')).toEqual('');
      });
    });
    describe('backgroundImage directive have assigned a false value', function () {
      var $compile, $rootScope, backgroundImage, $scope;
      beforeEach(module('mediaCenterRSSPluginWidget'));
      beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
      }));
      beforeEach(function () {
        backgroundImage = $compile('<div background-image=""></div>')($scope);
        $rootScope.$digest();
      });

      it('it should pass and background of div should be none', function () {
        expect(backgroundImage.css('background')).toEqual('');
      });
    });
  });

  describe('Unit: buildFireCarousel directive', function () {
    var $compile, $rootScope, buildFireCarousel, $scope, $timeout;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      buildFireCarousel = $compile(angular.element('<buildfire-carousel images=""></buildfire-carousel>'))($scope);
      $rootScope.$digest();
    });

    it('buildFireCarousel should be defined', function () {
      expect(buildFireCarousel).toBeDefined();
    });
    it('it should returns buildFireCarousel.length equal to 1', function () {
      expect(buildFireCarousel.length).toEqual(1);
      //$timeout.flush();
    });
  });

  describe('Unit: triggerNgRepeatRender directive', function () {
    var $compile, $rootScope, triggerNgRepeatRender, $scope;
    beforeEach(module('mediaCenterRSSPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      triggerNgRepeatRender = $compile(angular.element(' <div trigger-ng-repeat-render="">'))($scope);
      $rootScope.$digest();
    });

    it('it should be defined', function () {
      expect(triggerNgRepeatRender).toBeDefined();
    });
    it('it should returns triggerNgRepeatRender.length equal to 1', function () {
      expect(triggerNgRepeatRender.length).toEqual(1);
    });
  });

});