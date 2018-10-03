// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-10-09 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({
    reporters: ['progress', 'coverage'],

    preprocessors: {
      'src/**/!(*.spec).js': ['coverage'],
      'src/**/*.html': 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      // templates are moved to another path with a grunt task
      // the cacheId has to be calculated the same way
      cacheIdFromPath: function(filepath) {
        var templateName = filepath.split('/').pop();
        return 'templates/' + templateName;
      },
      // all templates are made available in one module
      // include this module in your tests and it will load templates from cache without making http requests
      moduleName: 'udb.templates'
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/angular-messages/angular-messages.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/lodash/index.js',
      'node_modules/socket.io-client/dist/socket.io.js',
      'node_modules/angular-socket-io/socket.js',
      'node_modules/ui-select/dist/select.js',
      'node_modules/moment/moment.js',
      'node_modules/accounting/accounting.js',
      'node_modules/angular-translate/dist/angular-translate.js',
      'node_modules/angular-moment/angular-moment.js',
      'node_modules/codemirror/lib/codemirror.js',
      'node_modules/codemirror/mode/solr/solr.js',
      'node_modules/angular-ui-codemirror/src/ui-codemirror.js',
      'node_modules/angular-xeditable/dist/js/xeditable.js',
      'node_modules/ng-file-upload/dist/ng-file-upload.js',
      //'node_modules/bootstrap-datepicker/js/bootstrap-datepicker.js',
      'node_modules/rx/dist/rx.all.js',
      'node_modules/rx-angular/dist/rx.angular.js',
      'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
      'node_modules/ng-focus-if/focusIf.js',
      'node_modules/ng-tags-input/build/ng-tags-input.js',
      'node_modules/angular-scroll/angular-scroll.js',
      'node_modules/angular-filter/dist/angular-filter.js',
      'src/**/*.module.js',
      'src/**/*.js',
      'src/**/*.html'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8088,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
