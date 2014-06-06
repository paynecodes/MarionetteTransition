define(['jquery', 'underscore', 'backbone.marionette', 'gsap.tweenlite', 'gsap.cssplugin', 'MarionetteTransition', 'animations/opacity'], function($, _, Marionette, TweenLite, CSSPlugin, MarionetteTransition, opacity) {
    'use strict';

    var Fade = MarionetteTransition.extend({
        prepareCommonOptions: function(options) {
            options.duration = 0.4;
        },
        prepareNewView: function(view, options) {
            /*jshint unused:false */
            var setOptions = {};

            view.$el.addClass('mt-view');

            _.extend(setOptions, { 'opacity': '0' });

            TweenLite.set(view.$el, setOptions);
        },
        prepareOldView: function(view, options) {
            /*jshint unused:false */
            var setOptions = {};

            view.$el.addClass('mt-view');

            _.extend(setOptions, { 'opacity': '1' });

            TweenLite.set(view.$el, setOptions);
        },
        enterAnimation: function(view, options) {
            return opacity(view.$el, _.extend(options, { 'opacity': '1' }));
        },
        exitAnimation: function(view, options) {
            return opacity(view.$el, _.extend(options, { 'opacity': '0' }));
        }
    });

    return Fade;

});
