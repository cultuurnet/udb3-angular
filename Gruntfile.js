// Generated on 2014-10-09 using generator-angular 0.9.8
'use strict';

var xml2js = require('xml2js');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'src',
    dist: 'dist',
    dev: {}
  };

  var getTaxonomyTerms = function () {
    var parser = new xml2js.Parser({mergeAttrs: true, explicitArray: false});
    var xmlBuffer = grunt.file.read('taxonomy-terms.xml');
    var terms = [];
    parser.parseString(xmlBuffer, function (err, result) {
      terms = result.cdbxml.categorisation.term;
    });

    return terms;
  };

  var getCities = function () {
    var parser = new xml2js.Parser({mergeAttrs: true, explicitArray: false});
    var xmlBuffer = grunt.file.read('cities.xml');
    var cities = [];
    parser.parseString(xmlBuffer, function (err, result) {
      // Limit cities data to Dutch name and zip code. That's all we currently
      // need in the application.
      cities = result.cdbxml.cities.city.map(
        function (city) {
          return {
            'name': city.labelnl,
            'zip': city.zip
          };
        }
      );
    });

    return cities;
  };

  var getEventFormCategories = function () {
    return require('./src/event_form/categories.json');
  };

  var getFacilities = function () {
    return require('./src/event_form/facilities.json');
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/**/*.js'],
        tasks: [
          'autoprefixer',
          'ngtemplates',
          'newer:jshint:all',
          'concat:modules',
          'concat:dist',
          'ngAnnotate',
        ],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      html: {
        files: ['<%= yeoman.app %>/**/*.html'],
        tasks: [
          'autoprefixer',
          'ngtemplates',
          'concat:modules',
          'concat:dist',
          'ngAnnotate',
        ],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: [
          '<%= yeoman.app %>/styles/{,*/}*.less',
          'bower_components/components-font-awesome/{,*/}*.less'
        ],
        tasks: ['less', 'newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      peg: {
        files: ['<%= yeoman.app %>/grammar/{,*/}*.grammar'],
        tasks: ['peg']
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9999,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        ignores: ['src/search/parsers/{,*/}*.js']
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/**/*.js',
          '!src/**/*.spec.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    less: {
      app: {
        options: {
          paths: [
            'bower_components/bootstrap/less',
            'bower_components/components-font-awesome/less',
          ],
          strictMath: true
        },
        files: {
          'dist/udb3-angular.css': '<%= yeoman.app %>/styles/udb-dist.less'
        }
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        exclude: [
          'bower_components/bootstrap/dist/css/bootstrap.css',
          'bower_components/components-font-awesome/css/font-awesome.css'
        ],
        ignorePath:  /\.\.\//,
        options: {
          'overrides': {
            'socket.io-client': {
              'main': 'socket.io.js'
            },
            'angular-i18n': {
              'main': 'angular-locale_nl-be.js'
            }
          }
        }
      }
    },

    //The following *-min tasks will produce minified files in the dist folder
    //By default, your `index.html`'s <!-- Usemin block --> will take care of
    //minification. These next options are pre-configured if you do not wish
    //to use the Usemin blocks.
    cssmin: {
       dist: {
         files: {
           '<%= yeoman.dist %>/udb3-angular.min.css': [
             '<%= yeoman.dist %>/udb3-angular.css'
           ]
         }
       }
    },
    uglify: {
       dist: {
         files: {
           '<%= yeoman.dist %>/udb3-angular.min.js': [
             '<%= yeoman.dist %>/udb3-angular.js'
           ]
         }
       }
    },
    concat: {
      modules: {
        src: [
          'src/core/udb.core.module.js',
          'src/router/udb.router.module.js',
          'src/core/udb.config.module.js',
          'src/search/udb.search.module.js',
          'src/event_form/udb.event-form.module.js',
          'src/dashboard/udb.dashboard.module.js',
          'src/entry/udb.entry.module.js',
          'src/event-detail/udb.event-detail.module.js',
          'src/place-detail/udb.place-detail.module.js',
          'src/saved-searches/udb.saved-searches.module.js',
          'src/export/udb.export.module.js',
          'src/media/udb.media.module.js',
          'src/search/parsers/udb-query-parser.service.js'
        ],
        dest: '.tmp/udb3-angular.modules.js'
      },
      dist: {
        src:  [
          '.tmp/udb3-angular.modules.js',
          'src/**/*.js',
          '!src/**/*.spec.js',
          '!src/**/*.module.js',
          '!src/search/parsers/udb-query-parser.service.js',
          '.tmp/udb3-angular.templates.js'
        ],
        dest: 'dist/udb3-angular.js',
        options: {
          banner: '\'use strict\';\n',
          // TODO: wrap all js files in a IIFE, see: https://github.com/johnpapa/angularjs-styleguide#iife
          process: function(src, filepath) {
            return '// Source: ' + filepath + '\n' +
              src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        }
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: ['*.js'],
          dest: 'dist'
        }]
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    peg: {
      options: { trackLineAndColumn: true },
      lucene : {
        src: '<%= yeoman.app %>/search/parsers/udb-query-parser.grammar',
        dest: '<%= yeoman.app %>/search/parsers/udb-query-parser.service.js',
        options: {
          wrapper: function (src, parser) {
            return '\'use strict\';\n' +
              'angular.module(\'peg\', []).factory(\'LuceneQueryParser\', function () {\n' +
              ' return ' + parser + '\n' +
              '});';
          }
        }
      }
    },

    ngconstant: {
      options: {
        name: 'udb.config',
        dest: 'src/core/udb.config.module.js'
      },
      dev: {
        constants: function() {
          return {
            appConfig: {},
            taxonomyTerms: getTaxonomyTerms(),
            eventCategories: getEventFormCategories().event,
            placeCategories: getEventFormCategories().place,
            facilities: getFacilities(),
            cities: getCities()
          };
        }
      },
      dist: {
        constants: function() {
          return {
            appConfig: {},
            taxonomyTerms: getTaxonomyTerms(),
            eventCategories: getEventFormCategories().event,
            placeCategories: getEventFormCategories().place,
            facilities: getFacilities(),
            cities: getCities()
          };
        }
      }
    },

    curl: {
      'taxonomy-terms': {
        src: 'http://taxonomy.uitdatabank.be/api/term',
        dest: 'taxonomy-terms.xml'
      },
      'cities': {
        src: 'http://taxonomy.uitdatabank.be/api/city',
        dest: 'cities.xml'
      }
    },

    ngtemplates:  {
      'udb.core':        {
        src:      'src/**/*.html',
        dest:     '.tmp/udb3-angular.templates.js',
        options:  {
          url:    function(url) {
            var templateName = url.split('/').pop();
            return 'templates/' + templateName;
          }
        }
      }
    },

    jscs: {
      src: [
        'src/**/*.js',
        '!src/**/*.spec.js',
        '!src/**/*.module.js',
        '!src/**/*.value.js',
        '!src/search/parsers/udb-query-parser.service.js'
      ],
      options: {
        config: '.jscs.json'
      }
    },

    coveralls: {
      options: {
        coverageDir: 'coverage/',
        recursive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-peg');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  grunt.registerTask('test', [
    'clean:server',
    'ngconstant:dev',
    'peg',
    'less',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'curl:taxonomy-terms',
    'curl:cities',
    'ngconstant:dist',
    'peg',
    'less',
    'autoprefixer',
    'ngtemplates',
    'jscs',
    'jshint:all',
    'concat:modules',
    'concat:dist',
    'ngAnnotate',
    'cssmin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
