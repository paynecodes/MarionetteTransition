define(['jquery', 'underscore'], function($, _) {
    'use strict';

    var cachedEvtName = '';

    var Transitioner = {

        transitionEndEventName: function() {
            if (cachedEvtName.length) return cachedEvtName;

            var possibleEvtNames = {
                'WebkitAnimation' : 'webkitAnimationEnd',
                'OAnimation' : 'oAnimationEnd',
                'msAnimation' : 'MSAnimationEnd',
                'animation' : 'animationend'
            };
            cachedEvtName = possibleEvtNames[ Modernizr.prefixed( 'animation' ) ];
            return cachedEvtName;
        },

        startTransition: function($parentEl) {
            $parentEl.addClass(this.animatingClass);
        },

        transitionInClasses: function(options) {
            return getTransitionClasses(options) + ' in';
        },

        transitionOutClasses: function(options) {
            return getTransitionClasses(options) + ' out';
        },

        animatingClass: 'animating'

    };

    // Private
    function getTransitionClasses(options) {
        return options.type + ' ' + options.direction;
    }

    return Transitioner;
});