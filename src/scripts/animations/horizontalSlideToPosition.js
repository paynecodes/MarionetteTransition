define(['gsap.tweenlite', 'gsap.cssplugin'], function(TweenLite, CSSPlugin) {
    'use strict';

    var horizontalSlideToPosition = function(el, position, options) {
        return new TweenLite.to(el, options.duration, {
            x: position + "px",
            opacity: options.opacity || "1"
        });
    };

    return horizontalSlideToPosition;
});
