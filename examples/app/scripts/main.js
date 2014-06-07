require(['app', 'domReady', 'apps/home/home_app', 'apps/modal/modal_app'], function(App, domReady) {
    'use strict';

    // Attaching the App object to the window
    // for debugging purposes
    window.App = App;

    domReady(function() {
        // Needed to execute this on the next turn
        // For some reason, my App was starting, but
        // the routing events weren't fired.
        _.defer(function() {
            App.start();
        });
    });

});
