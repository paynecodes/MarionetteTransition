/*
** MarionetteTransition 0.1.8
** Description: Make your dancing Marionette apps transition beautifully.
** Author: Jarrod Payne
** Company: Webotomy
** License: MIT
*/
(function (root, factory) {
    // Set up MarionetteTransition appropriately for the environment.
    // An example of this methodology can be found here: https://github.com/requirejs/example-libglobal
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'underscore', 'backbone', 'backbone.marionette'], factory);
    } else {
        // Browser globals
        root.MarionetteTransition = factory((root.jQuery || root.Zepto), root._, root.Backbone, root.Marionette);
    }
}(this, function ($, _, Backbone, Marionette) {

