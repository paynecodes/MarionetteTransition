define(['jquery', 'underscore'], function($, _) {
    'use strict';

    var Transitioner = {

        transitionEndEventName: function() {
            return 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd';
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
