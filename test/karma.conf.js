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
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/lodash/lodash.js',
      'bower_components/socket.io-client/socket.io.js',
      'bower_components/angular-socket-io/socket.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/moment/moment.js',
      'bower_components/accounting/accounting.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-moment/angular-moment.js',
      'bower_components/codemirror/lib/codemirror.js',
      'bower_components/codemirror/mode/solr/solr.js',
      'bower_components/angular-ui-codemirror/ui-codemirror.js',
      'bower_components/angular-xeditable/dist/js/xeditable.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js',
      'bower_components/rxjs/dist/rx.all.js',
      'bower_components/rx-angular/dist/rx.angular.js',
      'bower_components/ng-focus-if/focusIf.js',
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
