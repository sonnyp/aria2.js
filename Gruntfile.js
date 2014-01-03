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
            'Gruntfile.js',
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
        'Gruntfile.js',
        'lib/**/*.js',
        'test/**/*.js',
        'example/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
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
    },
    watch: {
      scripts: {
        files: "<%= concat.dist.src %>",
        tasks: ['build'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('syntax', ['jsvalidate', 'jshint']);
  grunt.registerTask('test', ['jsvalidate', 'mocha', 'jshint']);
  grunt.registerTask('default', 'test');
};