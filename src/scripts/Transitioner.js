define(['jquery', 'underscore'], function($, _) {
    'use strict';

    function getTransitionInClass(options) {
        var transitionClass = '';
        // Determine the type of transition and build the css transformation.
        transitionClass = options.type + ' ' + options.direction;
        return transitionClass + ' in';
    }

    function getTransitionOutClass(options) {
        var transitionClass = '';
        // Determine the type of transition and build the css transformation.
        transitionClass = options.type + ' ' + options.direction;

        return transitionClass + ' out';
    }

    var Transitioner = {

        initialize: function() {

            var animEndEventNames = {
                'WebkitAnimation' : 'webkitAnimationEnd',
                'OAnimation' : 'oAnimationEnd',
                'msAnimation' : 'MSAnimationEnd',
                'animation' : 'animationend'
            };

            return this.transEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];
        },

        transition: function($inEl, $outEl, options) {
            var self = this,
                 transitionInClass = '',
                 transitionOutClass = '',
                 animatingClass = 'animating',
                 $parentEl = $outEl.parent();

            this.initialize();

            // Define options if it's undefined
            if (typeof options == 'undefined') options = {};

            // Setup some options defaults
            _.defaults(options, {
                type: 'slide',
                direction: 'left',
                transitionEndCb: null
            });

            // Get the classes needed for the CSS Transition
            transitionInClass = getTransitionInClass(options);
            transitionOutClass = getTransitionOutClass(options);

            // Be sure that old event handlers aren't lingering around
            $outEl.off(this.transEndEventName);

            // Stand up a new event handler to listen for the end of the transition
            $outEl.on(this.transEndEventName, function() {
                $outEl.off(self.transEndEventName);
                $parentEl.removeClass(animatingClass);
                $outEl.removeClass(transitionOutClass);
                $inEl.removeClass(transitionInClass);

                if (_.isFunction(options.transitionEndCb)) options.transitionEndCb.call(self);
            });

            // Add the classes to the necessary elements
            $inEl.addClass(transitionInClass);
            $outEl.addClass(transitionOutClass);

            $parentEl.append($inEl);

            // Start the animation by adding the last class to the $inEl parent
            // the $inEl parent should be same as the $outEl parent.
            // We're going to wait for the next turn to add this class,
            // to ensure the DOM has had a chance to settle down
            _.defer(function() {
                $parentEl.addClass(animatingClass);
            });
        }

    };

    return Transitioner;
});