/*
** MarionetteTransition 0.1.5
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

/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define('transitioner',['jquery', 'underscore'], function($, _) {
    

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
define('AnimatedRegion',['jquery', 'underscore', 'transitioner'], function($, _, Transitioner) {
    

    var _show = Marionette.Region.prototype.show,
         _slice = [].slice;

    var AnimatedRegion = Marionette.Region.extend({
        initialize: function() {
            // Listening to show here only once instead of using onShow
            // We only want to perform this operation once for each instance of a region.
            this.listenToOnce(this, 'show', function() {
                this.$el.addClass('animated-region');
            });
        },
        show: function(newView, options) {
            // Hold up! This region is still animating
            if (this.isAnimating) return;

            // Do we have a view currently?
            var currentView = this.currentView,
                 args;

            args = 1 <= arguments.length ? _slice.call(arguments, 0) : [];

            // If we don't currently have a view, simply show the newView and exit
            if (!currentView || currentView.isClosed){
                _show.apply(this, args);
                return;
            } else this.transitionToView(newView, currentView, options);
        },
        transitionToView: function(newView, currentView, options) {
            this.isAnimating = true;
            options = setupOptionsDefaults.call(this, newView, options);

            var self = this,
                 transInClasses = Transitioner.transitionInClasses(options),
                 transOutClasses = Transitioner.transitionOutClasses(options),
                 animatingClass = Transitioner.animatingClass,
                 transitionEndEventName = Transitioner.transitionEndEventName();

            this.ensureEl();

            var isViewClosed = newView.isClosed || _.isUndefined(newView.$el);
            var isDifferentView = newView !== this.currentView;

            // Listen for the transition end event.
            // First, we'll make sure to clean up any lingering listeners
            newView.$el.off(transitionEndEventName);
            newView.$el.on(transitionEndEventName, function() {
                // Close the old view up
                self.close();
                self.currentView = newView;
                // Turn off the transition end event handler
                newView.$el.off(transitionEndEventName);
                // Clean up classes
                options.animatingEl.removeClass(animatingClass);
                newView.$el.removeClass(transInClasses);

                self.isAnimating = false;

                // Call the transition end callback function passed in from options
                if (_.isFunction(options.transitionEndCb)) options.transitionEndCb.call(self);
            });

            // When this event fires, we can now be sure that the newView.$el is in the DOM
            this.listenTo(newView, 'dom:refresh', function() {
                // Call the private transition function
                // only if the option.shouldStartAnim is true
                // which is the case by default.
                if (options.shouldStartAnim) {
                    transition(options);
                }
            });

            newView.$el.addClass(transInClasses);
            currentView.$el.addClass(transOutClasses);

            currentView.trigger('willTransition');

            newView.render();
            Marionette.triggerMethod.call(newView, "before:show");
            Marionette.triggerMethod.call(this, "before:show", newView);

            if (isDifferentView || isViewClosed) {
              this.openAppend(newView);
            }

            // Trigger the "show" method on the region and newView as usual
            Marionette.triggerMethod.call(this, "show", newView);
            Marionette.triggerMethod.call(newView, "show");
        },
        openAppend: function(view) {
            this.$el.append(view.el);
        }
    });

    // Private

    // This function is responsible for setting up some
    // default options on the passed in options object
    //
    // It clones the options object because of the way JavaScript passes
    // object by reference. If we didn't clone this object, subsequent calls
    // using the same options object would contain these mutated values
    // as well.
    //
    // Below are the descriptions of the defaults set on the options object.
    //
    // type: "slide", "scaleDown"
    // The type of transition you'd like to perform
    // You can create your own transitions by checking out
    // how we're doing them here. The options.type value you pass
    // will be a class on the .in and .out elements
    //
    // direction: "left", "right", "up", "down"
    // The direction in which the transition should occur
    // Again, create your own if you'd like. The options.direction
    // value will be a class on the .in and .out elements
    //
    // transitionEndCb: null, function()
    // Use this if you'd like to do some additional things after
    // the transition is complete. We're already doing some regular
    // Backbone/Marionette style cleanup for you. See where we listen
    // for the newView.$el.on(transitionEndEventName, function...)
    // to see what we're doing already.
    //
    // animatingEl: self.$el, any jQuery object
    // The element that should receive the .animating class
    // to begin the transition. This will often be the default,
    // but you can use this if you'd like to animate more than one
    // region at one time, only applying this class to a single DOM
    // element like $('body').
    // You should use this in combination with
    // options.beforeAnimate and options.shouldStartAnim
    //
    // shouldStartAnim: true, false
    // Should we call the transition function at all?
    // If you are using a single animatingEl for more than one region,
    // and are using a beforeAnimate deferred object,
    // you likely don't want to call the transition() function at all for the
    // for the view your waiting to resolve the deferred. This way, when
    // when the deferred is resolved, you can call the transition() function
    // only once.
    //
    // beforeAnimate: null, $.Deferred
    // If you'd like to do some things before the animation occurs,
    // like adding more than one view to the dom, pass a jQuery deferred object
    // or a deferred object that has a common .done() API. You'll be responsible
    // for resolving that deferred object which will trigger the animation
    function setupOptionsDefaults(newView, options) {
        var self = this;
        options = _.clone(options) || {};
        options = _.defaults(options, {
            type: 'slide',
            direction: 'left',
            transitionEndCb: null,
            animatingEl: self.$el,
            shouldStartAnim: true,
            beforeAnimate: null
        });
        return options;
    }

    // This function is responsible for starting our
    // transition. I'm sorry that this function is so crazy.
    // It's taken me hours to figure our why this has to be
    // so difficult in Safari Desktop and iOS.
    //
    // It accepts the options object containing some vital information
    // about whether it should trigger the animation immediately, or
    // wait for a deferred object to resolve.
    //
    // Basically, when this function is called,
    // _.defer causes it to wait until the next turn of the
    // JavaScript loop.
    // Then, _.delay delays the execution by 20ms. Again, I'm sorry for the
    // magic number here, but, for some reason, Safari hates
    // it when I try to begin the animation just after the element
    // is placed in the DOM. I suspect this is a repaint/reflow thing,
    // but every other modern browser handled it just fine without
    // this mess.
    //
    // Once, the interesting part of this function executes,
    // we check to see if a deferred object is being passed
    // in options.beforeAnimate. If one has, we'll perform the
    // action when the deferred object is resolved.
    // If the options.beforeAnimate is set to null (default), we'll
    // go ahead and perform the action.
    function transition(options) {
        _.defer(function() {
            _.delay(function() {
                if (options.beforeAnimate) options.beforeAnimate.done(function() {
                    Transitioner.startTransition(options.animatingEl);
                });
                else Transitioner.startTransition(options.animatingEl);
            }, 20);
        });
    }

    return AnimatedRegion;
});

define('Transitioner',['jquery', 'underscore'], function($, _) {
    

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
    //Register in the values from the outer closure for common dependencies
    //as local almond modules
    define('jquery', function () {
        return $;
    });
    define('underscore', function () {
        return _;
    });
    define('backbone', function () {
        return Backbone;
    });
    define('backbone.marionette', function () {
        return Marionette;
    });

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return require('AnimatedRegion');
}));