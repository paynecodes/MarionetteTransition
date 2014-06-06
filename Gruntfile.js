// Generated on 2014-02-28 using generator-webapp 0.4.7
'use strict';

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

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'src',
            dist: 'dist'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
            ]
        },

        // Copies remaining files to places other tasks can use
        copy: {
            amd: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>/scripts/',
                dest: '<%= yeoman.dist %>/scripts/amd',
                src: [
                    '{,*/}*.js',
                ]
            }
        },

        requirejs: {
            options: {
                baseUrl: '<%= yeoman.app %>/scripts',
                paths: {
                    'jquery': '../bower_components/jquery/dist/jquery',
                    'underscore': '../bower_components/underscore/underscore',
                    'backbone': '../bower_components/backbone/backbone',
                    'backbone.marionette': '../bower_components/backbone.marionette/lib/backbone.marionette',
                    'almond': '../bower_components/almond/almond',
                    'gsap.tweenlite': '../bower_components/gsap/src/uncompressed/TweenLite',
                    'gsap.cssplugin': '../bower_components/gsap/src/uncompressed/plugins/CSSPlugin'
                },
                shim: {
                    'gsap.cssplugin': {
                        exports: 'CSSPlugin',
                        deps: ['gsap.tweenlite']
                    },
                    'gsap.tweenlite': {
                        exports: 'TweenLite'
                    }
                },
                include: ['almond', 'MarionetteTransition'],
                exclude: ['jquery', 'underscore', 'backbone', 'backbone.marionette', 'gsap.tweenlite', 'gsap.cssplugin'],
                out: '<%= yeoman.dist %>/scripts/MarionetteTransition.min.js',
                optimize: 'uglify',
                wrap:{
                    startFile:'<%= yeoman.app %>/fragments/wrap-start.frag',
                    endFile:'<%= yeoman.app %>/fragments/wrap-end.frag'
                }
            },
            dist: {},
            distNoMin: {
                options: {
                    out: '<%= yeoman.dist %>/scripts/MarionetteTransition.js',
                    optimize: 'none'
                }
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy:amd',
        'requirejs:dist',
        'requirejs:distNoMin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
