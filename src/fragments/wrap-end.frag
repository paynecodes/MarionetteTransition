    //Register in the values from the outer closure for common dependencies
    //as local almond modules
    define('jquery', function () {
        return $;
    });
    define('underscore', function () {
        return _;
    });
    define('backbone', function () {
        return Backbone;
    });
    define('backbone.marionette', function () {
        return Marionette;
    });

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return require('MarionetteTransition');
}));
