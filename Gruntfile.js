'use strict';

module.exports = function(grunt) {

  // measures the time each task takes
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),  // Parse package.json info
    replace: {  // Replace distribution related variables to produce README.md
      dist: {
        options: {
          patterns: [
            {
              json: {
                '_un_minimized_file_': '<%= browserify.standalone.output_file %>',
                '_minimized_file_': '<%= uglify.all.output_file %>',
                '_pkg_version_': '<%= pkg.version %>'
              }
            }
          ]
        },
        files: [
          { src: 'README.template.md', dest: 'README.md'}
        ]
      }
    },
    markdown: {
      all: {
        files: [
          {
            expand: true,
            src: 'README.md',
            dest: './',
            ext: '.md.html'
          }
        ]
      }
    },
    jsdoc: {
      all: {
        src: ['lib/*.js', 'test/*.js'],
        jsdoc: 'node_modules/.bin/jsdoc',
        options: {
          destination: 'docs',
          configure: './jsdoc.conf'
        }
      }
    },
    // jshint all the src files.
    jshint: {
      options: {
	eqeqeq: true,
	trailing: true
      },
      target: {
	src : ['lib/**/*.js',
               'test/unittests/*.js',
               '!lib/garbage/**/*',]
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'test/output/output.txt',
          require: 'test/coveragereports/blanket.js'
        },
        src: ['test/unittests/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true,
          // specify a destination file to capture the mocha
          // output (the quiet option does not suppress this)
          captureFile: 'test/output/coverage.html'
        },
        src: ['test/unittests/*.js']
      }
    },
    // remove all previous browserified builds
    clean: {
      dist: ['./dist/**/*', './README.md'],
      tests: ['./test/browsertests/browserified_tests.js',
              './test/output/**/*',
              './README.md'],
      docs: [ './README.md', './README.md.html', './docs/**/*']
    },
    // Parse AST for require() and build the browser code.
    browserify: {
      standalone: {
        //src: './lib/<%= pkg.name %>.js',
        src: './lib/agama.js',
        output_file: '<%= pkg.name %>.<%= pkg.version %>.standalone.js',
        dest: './dist/<%= browserify.standalone.output_file %>',
        options: {
          standalone: '<%= pkg.name %>',
          alias: {
            'agama': './lib/<%= pkg.name %>.js'
          },
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("h:MM:ss dd-mm-yyyy") %> */\n'
        }
      },
      tests: {
        src: 'test/browsertests/suite.js',
        dest: 'test/browsertests/browserified_tests.js',
        options: {
          external: [ './index.js' ],
          // Embed source map for tests
          debug: true
        }
      }
    },
    // Start the basic web server from connect.
    connect: {
      server: {},
      keepalive: {
        options: {
          keepalive: true
        }
      }
    },
    // run the mocha tests in the browser via PhantomJS
    mocha_phantomjs: {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:8000/test/browsertests/index.html'
          ]
        }
      }
    },
    // uglify our one agamageometry.js file.
    uglify: {
      all: {
        output_file: 'dist/<%= pkg.name %>.<%= pkg.version %>.standalone.min.js',
        files: {
          // Uglify browserified library
          '<%= uglify.all.output_file %>':
          ['<%= browserify.standalone.dest %>']
        },
        options: {
          banner: '/*! <%= pkg.name %>.<%= pkg.version %>.<%= grunt.template.today("yyyy-mm-dd") %> */\n'
        }
      }
    },
    watch: {
      options: {
        dateFormat: function(time) {
          grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
          grunt.log.writeln('Waiting for more changes...');
        }
      },
      scripts: {
        files: 'lib/*.js',
        tasks: ['docs', 'dist']
      }
    }
  });

  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('docs', ['clean:docs', 'replace', 'markdown', 'jsdoc']);
  grunt.registerTask('dist', ['clean:dist', 'browserify', 'uglify']);
  grunt.registerTask('localtest', ['clean:tests', 'jshint', 'mochaTest']);
  grunt.registerTask('browsertest', ['clean:tests', 'jshint', 'browserify', 'connect:server', 'mocha_phantomjs']);
  grunt.registerTask('test', ['localtest', 'browsertest', 'docs']);
  grunt.registerTask('default', ['localtest', 'docs']);
};
