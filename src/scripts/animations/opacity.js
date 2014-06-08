define(['TweenLite', 'CSSPlugin'], function(TweenLite) {
    'use strict';

    return function(el, options) {
        return TweenLite.to(el, options.duration, {
            opacity: options.opacity || '1',
            paused: options.paused || true
        });
    };

});
