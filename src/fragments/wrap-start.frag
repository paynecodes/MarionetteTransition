/*
** MarionetteTransition 0.1.0
** Description: Make your dancing Marionette apps transition beautifully.
** Author: Jarrod Payne
** Company: Webotomy
** License: MIT
*/
(function (root, factory) {
    // Set up RegionTransition appropriately for the environment.
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'underscore', 'backbone', 'backbone.marionette'], factory);
    } else {
        // Browser globals
        root.RegionTransition = factory((root.jQuery || root.Zepto), root._, root.Backbone, root.Marionette);
    }
}(this, function ($, _, Backbone) {