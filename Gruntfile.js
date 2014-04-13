'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files:[
        'package.json',
        '*.js',
        'lib/**/*.js',
        'test/**/*.js',
        'example/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
        jshintignore: '.jshintignore'
      }
    },

    // mochaTest: {
    //   test: {
    //     options: {
    //       reporter: 'spec',
    //       ui: 'tdd',
    //       bail: true
    //     },
    //     src: ['test/**/*.js']
    //   }
    // },

    concat: {
      dist: {
        src: [
          'bower_components/httpclient/HTTPClient.js',
          'lib/index.js'
        ],
        dest: 'aria2.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'aria2.min.js': ['aria2.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // grunt.registerTask('mocha', 'mochaTest');
  grunt.registerTask('syntax', ['jshint']);
  grunt.registerTask('test', ['jshint']);
  // grunt.registerTask('test', ['jsvalidate', 'mocha', 'jshint']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('default', 'test');
};