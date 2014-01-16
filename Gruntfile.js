'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsvalidate: {
      options:{
        globals: {},
        esprimaOptions: {},
        verbose: true
      },
      targetName:{
        files:{
          src:[
            '*.js',
            'lib/**/*.js',
            'test/**/*.js',
            'example/**/*.js',
          ]
        }
      }
    },
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
        jshintignore: '.jshintignore',
        ignores: ['node_modules/**.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          ui: 'tdd',
          bail: true
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('syntax', ['jsvalidate', 'jshint']);
  grunt.registerTask('test', ['jsvalidate', 'mocha', 'jshint']);
  grunt.registerTask('default', 'test');
};