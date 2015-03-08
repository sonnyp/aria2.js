'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      config: '.eslintrc',
      target: [
        '*.js',
        'example/**/*.js',
        'lib/**/*.js',
        'test/**/*.js',
      ]
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          ui: 'bdd',
          bail: false
        },
        src: ['test/**/*.js']
      }
    },

    concat: {
      dist: {
        src: [
          'bower_components/httpclient/HTTPClient.js',
          'lib/index.js'
        ],
        dest: 'dist/aria2.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/aria2.min.js': ['dist/aria2.js']
        },
        options: {
          sourceMap: true
        }
      },
    }

  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('mocha', 'mochaTest');
  grunt.registerTask('syntax', ['eslint']);
  grunt.registerTask('test', ['mocha', 'syntax']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('default', 'test');
};
