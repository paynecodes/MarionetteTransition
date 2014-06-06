/*jshint unused:false */
define(['gsap.tweenlite', 'gsap.cssplugin'], function(TweenLite, CSSPlugin) {
    'use strict';

    return function(el, position, options) {
        return TweenLite.to(el, options.duration, {
            x: position,
            opacity: options.opacity || '1',
            paused: options.paused || true
        });
    };

});
