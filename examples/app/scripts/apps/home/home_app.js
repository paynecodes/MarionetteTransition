define([
    'backbone.marionette',
    'app',
    'apps/home/show/show_controller',
    'apps/home/show/show_view'
], function(Marionette, App) {
    'use strict';

    var HomeApp, API;

    // HomeApp API
    API = {
        showHome: function(options) {
            var controller = new HomeApp.Show.Controller();
            controller.showHome(options);
        }
    };

    // Create and configure the HomeApp
    HomeApp = App.module('HomeApp');
    HomeApp.startWithParent = true;
    HomeApp.Router = Marionette.AppRouter.extend({
        controller: API,
        appRoutes: { '': 'showHome' }
    });

    HomeApp.addInitializer(function() {
        new HomeApp.Router();
    });
    App.on('show:home', function(options) {
        API.showHome(options);
        App.navigate('');
    });

    return HomeApp;

});
