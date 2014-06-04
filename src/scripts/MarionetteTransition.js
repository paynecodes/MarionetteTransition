define(['jquery', 'underscore', 'backbone.marionette', 'gsap.tweenlite', 'gsap.cssplugin', 'animations/horizontalSlideToPosition'], function($, _, Marionette, TweenLite, CSSPlugin, horizontalSlideToPosition) {
    'use strict';

    TweenLite.defaultOverwrite = 'all';

    var MarionetteTransition = Marionette.Region.extend({
        initialize: function(options) {
            this.views = [];
            this.currentViewIndex = -1;
        },
        showTransition: function(view, options) {
            var showOptions = this.setupTransitionOptions(options);
            var oldView = this.currentView;

            if (!showOptions.transtionWhenEmpty && !oldView) {
                this.show(view, showOptions);
                this._triggerViewEvent(view, 'transition:end');
                this._triggerViewEvent(view, 'transition:end:in');
                return this;
            }

            this.ensureEl();

            var isViewClosed = view.isClosed || _.isUndefined(view.$el);
            var isDifferentView = view !== this.currentView;
            var oldView = this.currentView;

            this.preventClose =  !!showOptions.preventClose;

            // only close the view if we don't want to preventClose and the view is different
            var _shouldCloseView = !this.preventClose && isDifferentView;

            view.render();
            this._triggerViewEvent(view, 'before:show');

            this.addViewToDom(view);
            this._triggerRepaint();

            this.transitionToView(view, oldView, showOptions)
                .done(_.bind(function() {
                    this.onComplete(view, oldView, showOptions);
                    this._cleanUpOldViews(view);
                }, this));

            this._triggerViewEvent(view, 'show');

            return this;
        },
        push: function(view, options) {
            this.ensureEl();

            var pushOptions = options || {};

            pushOptions.push = true;

            this.preventClose = true;
            var _shouldCloseView = this.preventClose;
            var oldView = this.currentView;

            view.render();
            this._triggerViewEvent(view, 'before:show');
            this._triggerViewEvent(view, 'before:push');

            this.addViewToDom(view);
            this._triggerRepaint();

            this.transitionToView(view, oldView, pushOptions)
                .done(_.bind(function() {
                    this.onComplete(view, oldView, pushOptions);
                }, this));

            this._triggerViewEvent(view, 'show');
            this._triggerViewEvent(view, 'push');

            this.addView(view);

            return this;
        },
        pop: function(options) {
            if (this.currentViewIndex <= 0 || this.views.length <= 1) return this;

            this.ensureEl();

            var popOptions = options || {};

            popOptions.pop = true;

            this.preventClose = false;
            var _shouldCloseView = this.preventClose;

            var oldView = this.currentView;
            var newView = this.views[this.currentViewIndex - 1];

            this._triggerViewEvent(newView, 'before:show');
            this._triggerViewEvent(newView, 'before:pop');

            this.transitionToView(newView, oldView, popOptions)
                .done(_.bind(function() {
                    this.onComplete(newView, oldView, popOptions);
                }, this));

            this._triggerViewEvent(newView, 'show');
            this._triggerViewEvent(newView, 'pop');

            this.removeView();

            return this;
        },
        transitionToView: function(newView, oldView, options) {
            this.prepareCommonOptions(options);
            this.prepareRegionContainer();
            this.prepareNewView(newView, options);
            if (oldView && oldView.$el) {
                this.prepareOldView(oldView, options);
            }

            var self = this;
            var deferred = $.Deferred();

            _.defer(function() {
                _.delay(function() {
                    if (options.beforeAnimate) {
                        if (_.isFunction(options.beforeAnimate)) {
                            options.beforeAnimate().done(transition);
                        } else {
                            options.beforeAnimate.done(transition);
                        }
                    } else {
                        transition();
                    }
                }, 30);
            });

            function transition() {
                self.enterAnimation(newView, options)
                    .eventCallback('onComplete', function() {
                        deferred.resolve();
                    })
                    .play();

                if (oldView && oldView.$el) {
                    self.exitAnimation(oldView, options)
                        .play();
                }
            }

            return deferred;
        },
        prepareCommonOptions: function(options) {
            options.distance = this.$el.width();
            options.duration = .4;
        },
        prepareRegionContainer: function() {
            var setOptions = {
                'position': 'relative'
            };

            TweenLite.set(this.$el, setOptions);
        },
        prepareNewView: function(view, options) {
            var setOptions = {
                'position': 'absolute',
                'width': '100%',
                'z-index': '1'
            };

            if (options.direction === 'backward' || options.pop) {
                _.extend(setOptions, { 'x': '-80' });
            } else {
                _.extend(setOptions, { 'x': options.distance });
            }

            TweenLite.set(view.$el, setOptions);
        },
        prepareOldView: function(view, options) {
            var setOptions = {
                'position': 'absolute',
                'width': '100%',
                'z-index': '1'
            };

            if (options.direction === "backward" || options.pop) {
                _.extend(setOptions, { 'z-index': '2' });
            }

            TweenLite.set(view.$el, setOptions);
        },
        addViewToDom: function(view) {
            this.$el.append(view.el);
        },
        enterAnimation: function(view, options) {
            return horizontalSlideToPosition(view.$el, 0, options);
        },
        exitAnimation: function(view, options) {
            if (options.pop || options.direction === "backward") {
                return horizontalSlideToPosition(view.$el, options.distance, options);
            } else {
                return horizontalSlideToPosition(view.$el, -80, _.extend(options, { opacity: "0" }))
            }
        },
        addView: function(view) {
            this.views.push(view);
            this.currentViewIndex++;
        },
        removeView: function(index) {
            index = index || this.views.length - 1;
            this.views.splice(index, 1);
            this.currentViewIndex--;
        },
        _cleanUpOldViews: function(newView) {
            _.each(this.views, function(view, index) {
                view.close();
            });

            this.views = [newView];
            this.currentViewIndex = 0;
        },
        _triggerRepaint: function() {
            this.$el.get(0).offsetHeight;
        },
        _triggerViewEvent: function(view, evtName) {
            Marionette.triggerMethod.call(this, evtName, view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod(evtName);
            } else {
                Marionette.triggerMethod.call(view, evtName);
            }
        },
        onComplete: function(newView, oldView, options) {
            this.currentView = newView;

            this._triggerViewEvent(newView, 'transition:end');
            this._triggerViewEvent(newView, 'transition:end:in');
            if (oldView) {
                this._triggerViewEvent(oldView, 'transition:end');
                this._triggerViewEvent(oldView, 'transition:end:out');
            }

            if (oldView && !this.preventClose) oldView.close();

            if (_.isFunction(options.onComplete)) {
                options.onComplete();
            }
        },
        setupTransitionOptions: function(options) {
            var opts = _.clone(options) || {};

            _.defaults(opts, {
                direction: 'forward',
                onStart: null,
                onComplete: null,
                transtionWhenEmpty: false
            });

            return opts;
        }
    });

    return MarionetteTransition;
});