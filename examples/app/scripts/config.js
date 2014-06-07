requirejs.config({
    paths: {
        animatedRegion: '../bower_components/MarionetteTransition/src/scripts/AnimatedRegion',
        backbone: '../bower_components/backbone/backbone',
        'backbone.marionette': '../bower_components/backbone.marionette/lib/backbone.marionette',
        jquery: '../bower_components/jquery/jquery',
        domReady: '../bower_components/requirejs-domready/domReady',
        text: '../bower_components/requirejs-text/text',
        transitioner: '../bower_components/MarionetteTransition/src/scripts/Transitioner',
        underscore: '../bower_components/underscore/underscore',
        MarionetteTransition: '../bower_components/MarionetteTransition/src/scripts/MarionetteTransition',
        FullPageModal: '../bower_components/MarionetteTransition/src/scripts/regions/FullPageModal',
        Fade: '../bower_components/MarionetteTransition/src/scripts/regions/Fade',
        TweenLite: '../bower_components/gsap/src/uncompressed/TweenLite',
        CSSPlugin: '../bower_components/gsap/src/uncompressed/plugins/CSSPlugin',
        'animations': '../bower_components/MarionetteTransition/src/scripts/animations'
    },
    shim: {
        backbone: {
            exports: 'Backbone',
            deps: [ 'underscore', 'jquery' ]
        },
        'backbone.marionette': {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        jquery: { exports: 'jQuery' },
        transitioner: {
            deps: ['backbone.marionette']
        },
        animatedRegion: {
            deps: ['backbone.marionette']
        },
        MarionetteTransition: {
            deps: ['backbone.marionette']
        },
        underscore: { exports: '_' },
        CSSPlugin: {
            exports: 'CSSPlugin',
            deps: ['TweenLite']
        },
        TweenLite: {
            exports: 'TweenLite'
        }
    }
});

require(['main']);
