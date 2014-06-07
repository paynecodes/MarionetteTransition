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

        // Package Config
        'pkg': grunt.file.readJSON('package.json'),

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'src',
            dist: 'dist',
            banner: '/*\n' +
            '** MarionetteTransition v<%= pkg.version %>\n' +
            '** Description: Make your dancing Marionette apps transition beautifully.\n' +
            '** Author: Jarrod Payne\n' +
            '** Company: Webotomy\n' +
            '** License: MIT\n' +
            '**\n' +
            '** Thanks to @jasonlaster and @jmeas for the help.\n' +
            '*/ \n\n'
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
                dest: '<%= yeoman.dist %>/amd',
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
                    'TweenLite': '../bower_components/gsap/src/uncompressed/TweenLite',
                    'CSSPlugin': '../bower_components/gsap/src/uncompressed/plugins/CSSPlugin'
                },
                shim: {
                    'CSSPlugin': {
                        exports: 'CSSPlugin',
                        deps: ['TweenLite']
                    },
                    'TweenLite': {
                        exports: 'TweenLite'
                    }
                },
                include: ['MarionetteTransition'],
                exclude: ['jquery', 'underscore', 'backbone', 'backbone.marionette', 'TweenLite', 'CSSPlugin'],
                out: '<%= yeoman.dist %>/MarionetteTransition.js',
                optimize: 'none',
                skipModuleInsertion: true,
                onModuleBundleComplete: function(data) {
                    var fs = module.require('fs'),
                        amdclean = module.require('amdclean'),
                        outputFile = data.path,
                        cleanedCode = amdclean.clean({
                            'filePath': outputFile
                        });

                    cleanedCode = cleanedCode.replace(/jquery/g, 'jQuery');
                    cleanedCode = cleanedCode.replace(/underscore/g, '_');
                    cleanedCode = cleanedCode.replace(/backbonemarionette/g, 'Marionette');

                    fs.writeFileSync(outputFile, cleanedCode);
                }
            },
            dist: {},
        },

        umd: {
            all: {
                src: '<%= yeoman.dist %>/MarionetteTransition.js',
                objectToExport: 'MarionetteTransition',
                template: 'umd',
                dest: '<%= yeoman.dist %>/MarionetteTransition.js',
                deps: { 'default': ['jQuery', '_', 'Marionette', 'TweenLite', 'CSSPlugin'] }
            }
        },

        // Add Banner
        'concat': {
            options: {
                banner: '<%= yeoman.banner %>',
                stripBanners: true
            },
            amd: {
                src: '<%= yeoman.dist %>/amd/MarionetteTransition.js',
                dest: '<%= yeoman.dist %>/amd/MarionetteTransition.js'
            },
            umd: {
                src: '<%= yeoman.dist %>/MarionetteTransition.js',
                dest: '<%= yeoman.dist %>/MarionetteTransition.js'
            }
        },

        // Minify JS
        'uglify': {
            umd: {
                src: '<%= yeoman.dist %>/MarionetteTransition.js',
                dest: '<%= yeoman.dist %>/MarionetteTransition.min.js'
            }
        },

        // Keep bower.json in sync with package.json
        /*jshint camelcase: false */
        update_json: {
            options: {
                indent: '  '
            },
            bower: {
                indent: '  ',
                src: 'package.json',
                dest: 'bower.json',     // where to write to
                // the fields to update, as a String Grouping
                fields: ['name', 'version', 'description', 'keywords', 'homepage', 'license']
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy:amd',
        'requirejs:dist',
        'umd:all',
        'concat:amd',
        'concat:umd',
        'uglify:umd',
        'update_json:bower'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
