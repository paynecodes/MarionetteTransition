define(['jquery', 'underscore', 'backbone.marionette', 'TweenLite', 'CSSPlugin', 'MarionetteTransition', 'animations/verticalSlideToPosition'], function($, _, Marionette, TweenLite, CSSPlugin, MarionetteTransition, verticalSlideToPosition) {
    'use strict';

    var FullPageModal = MarionetteTransition.extend({
        prepareCommonOptions: function(options) {
            options.distance = $('body').height();
            options.duration = 0.4;
        },
        prepareRegionContainer: function() {
            this.$el.addClass('open');
            this.bindRegionListeners();
        },
        bindRegionListeners: function() {
            this.listenToOnce(this, 'transition:end:out close', function() {
                this.$el.removeClass('open');
            });
        },
        prepareNewView: function(view, options) {
            var setOptions = {};

            view.$el.addClass('mt-view');

            _.extend(setOptions, { 'y': options.distance });

            TweenLite.set(view.$el, setOptions);
        },
        enterAnimation: function(view, options) {
            return verticalSlideToPosition(view.$el, 0, options);
        },
        exitAnimation: function(view, options) {
            return verticalSlideToPosition(view.$el, options.distance, options);
        }
    });

    return FullPageModal;

});
