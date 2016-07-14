describe('Unit: pluginPluginMediaCenterRSS widget filters', function () {
  beforeEach(module('mediaCenterRSSPluginWidget'));
  var filter;
  beforeEach(inject(
    function (_$filter_) {
      filter = _$filter_;
    }));

  describe('Unit: cropImage filter', function () {
    it('cropImage filter should returns an empty string if image url not provided', function () {
      var result;
      result = filter('cropImage')('', 88, 124);
      expect(result).toEqual('http://s7obnu.cloudimage.io/s/crop/88x124/');
    });
    it('cropImage filter should returns cropped image url', function () {
      var result;
      result = filter('cropImage')('https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg', 88, 124);
      expect(result).toEqual('http://s7obnu.cloudimage.io/s/crop/88x124/https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg');
    });
  });

  describe('Unit: resizeImage filter', function () {
    it('resizeImage filter should returns an empty string if image url not provided', function () {
      var result;
      result = filter('resizeImage')('', 88, 124);
      expect(result).toEqual('http://s7obnu.cloudimage.io/s/resizenp/88x124/');
    });
    it('resizeImage filter should returns resized image url', function () {
      var result;
      result = filter('resizeImage')('https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg', 88, 124);
      expect(result).toEqual("http://s7obnu.cloudimage.io/s/resizenp/88x124/https://imagelibserver.s3.amazonaws.com/25935164-2add-11e5-9d04-02f7ca55c361/950a50c0-400a-11e5-9af5-3f5e0d725ccb.jpg");
    });
  });

  describe('Unit: safeHtml filter', function () {
    it('safeHtml filter should returns an empty string if html value not provided', function () {
      var result;
      result = filter('safeHtml')(null);
      expect(result).toEqual('');
    });
    it('safeHtml filter should returns an empty string if html value provided', function () {
      var result;
      result = filter('safeHtml')("<p>&nbsp;<br>Sandeep kumar</p>");
      expect(typeof result).toEqual('object');
    });
  });

  describe('Unit: truncate filter', function () {
    it('truncate filter should returns value if it is a falsy value', function () {
      var result;
      result = filter('truncate')(null, 15);
      expect(result).toEqual(null);
    });
    it('truncate filter should returns a truncated string of given length', function () {
      var result;
      result = filter('truncate')('JavaScript is a dynamically typed language which comes with great power of expression, but it also comes with almost no help from the compiler.', 15);
      expect(result.length).toEqual(15);
    });
    it('truncate filter should replace html tags and returns a truncated string of given length', function () {
      var result;
      result = filter('truncate')('<p><a href="https://en.wikipedia.org/wiki/JavaScript">JavaScript</a> is a dynamically typed language which comes with great power of expression, but it also comes with almost no help from the compiler.</p>', 30);
      expect(result).toEqual('JavaScript is a dynamically t…');
      expect(result.length).toEqual(30);
    });
  });

  describe('Unit: removeHtmlStyle filter', function () {
    it('removeHtmlStyle filter should returns a html tag free string', function () {
      var result;
      result = filter('removeHtmlStyle')('<p style="color: #ee5f5b; font-style: italic;">JavaScript is a dynamically typed language</p>');
      expect(result).toEqual('<p>JavaScript is a dynamically typed language</p>');
    });
    it('removeHtmlStyle filter should returns value if value is not html or string', function () {
      var result;
      result = filter('removeHtmlStyle')(null);
      expect(result).toEqual(null);
    });
  });

  describe('Unit: extractImgSrc filter', function () {
    it('extractImgSrc filter should returns an empty string if image not found in html string', function () {
      var result;
      result = filter('extractImgSrc')('<p><a href="https://en.wikipedia.org/wiki/JavaScript">JavaScript</a> is a dynamically typed language</p>');
      expect(result).toEqual('');
    });
    it('extractImgSrc filter should returns an image src url if it found in html string', function () {
      var result;
      result = filter('extractImgSrc')('<p><img src="http://www.b2bweb.fr/wp-content/uploads/js-logo-badge-512.png"/><a href="https://en.wikipedia.org/wiki/JavaScript">JavaScript</a> is a dynamically typed language</p>');
      expect(result).toEqual("http://www.b2bweb.fr/wp-content/uploads/js-logo-badge-512.png");
    });
    it('extractImgSrc filter should returns an empty string if src not found', function () {
      var result;
      result = filter('extractImgSrc')('<p><img height="220" width="220" src=""/><a href="https://en.wikipedia.org/wiki/JavaScript">JavaScript</a> is a dynamically typed language</p>');
      expect(result).toEqual('');
    });
  });

  describe('Unit: timeCorrect filter', function () {
    it('timeCorrect filter should returns time in a valid format', function () {
      var timeLeft = filter('date')(1442302441217, 'mm:ss', '+0530')
        , result = filter('timeCorrect')(timeLeft);
      expect(result).toEqual('04:01');
    });
  });

  describe('Unit: secondsToDateTime filter', function () {
    it('it should be convert seconds to minutes using secondsToDateTime filter and date filter', function () {
      var _secondsToDateTime = filter('secondsToDateTime')(4200)
        , result = filter('date')(_secondsToDateTime, 'mm:ss');
      expect(result).toEqual('10:00');
    });
  });
});