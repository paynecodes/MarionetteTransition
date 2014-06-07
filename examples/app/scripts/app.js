define([
    'backbone.marionette',
    'MarionetteTransition',
    'FullPageModal',
    'config/marionette/application'
], function(Marionette, MarionetteTransition, FullPageModal) {
    'use strict';

    var App;

    App = new Marionette.Application();
    App.rootRoute = '';

    document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });

    App.addRegions({
        headerRegion: {
            selector: '#header',
            regionType: MarionetteTransition
        },
        mainRegion: {
            selector: '#page',
            regionType: MarionetteTransition
        },
        modalRegion: {
            selector: '#modal',
            regionType: FullPageModal
        }
    });

    App.addInitializer(function() {
        App.module('HomeApp').start();
        App.module('ModalApp').start();
    });

    App.on('initialize:after', function() {
        // Start Backbone History
        if (Backbone.history) {
            Backbone.history.start();
        }
    });

    return App;
});
