/*
** In this configuration file we are overriding the Marionette Application prototype
** to include two methods we can use throughout our app.
** Method 1: navigate() will use Backbone to alter the url with a given 'route'. Options
**     should be used especially when the route should trigger Backbone routing events
**     using { trigger: true }
**  Method 2: getCurrentRoute() will give us back the current Backbone route
**     for 'example.com/#home' we would get back 'home'
*/
define(['backbone.marionette'], function(Marionette) {
    return _.extend(Marionette.Application.prototype, {
        navigate: function(route, options) {
            if (typeof options == 'undefined') {
                options = { trigger: false };
            }
            return Backbone.history.navigate(route, options);
        },
        getCurrentRoute: function() {
            return Backbone.history.fragment;
        },
        getSegment: function(number) {
            var currentRoute = this.getCurrentRoute();
            var segments = currentRoute.split('/');

            return segments[number-1];
        }
    });
});
