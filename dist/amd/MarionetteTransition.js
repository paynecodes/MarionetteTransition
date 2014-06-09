/*
** MarionetteTransition v0.3.1
** Description: Make your dancing Marionette apps transition beautifully.
** Author: Jarrod Payne
** Company: Webotomy
** License: MIT
**
** Thanks to @jasonlaster and @jmeas for the help.
*/ 

define(['jquery', 'underscore', 'backbone.marionette', 'TweenLite', 'CSSPlugin', 'animations/horizontalSlideToPosition'], function($, _, Marionette, TweenLite, CSSPlugin, horizontalSlideToPosition) {
    'use strict';

    var MarionetteTransition = Marionette.Region.extend({
        initialize: function(options) {
            /*jshint unused:false */
            this.setup();
        },
        setup: function() {
            this.viewStack = [];
            this.currentViewIndex = -1;
            this.listenToOnce(this, 'show', this.onFirstShow);
        },
        onFirstShow: function() {
            this.$el.addClass('mt-region');
        },
        show: function() {
            var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

            var view = args[0];

            this.listenTo(view, 'show', function() {
                // Without deferring this our _resetViews method was blocking rendering
                // Not sure why, but need to come back to this later.
                _.defer(_.bind(function() {
                    this._resetViews(view);
                    this._triggerViewEvent(view, 'transition:end');
                    this._triggerViewEvent(view, 'transition:end:in');
                }, this));
            });

            this._show.apply(this, args);

            this._cleanUpOldViews();


            return this;
        },
        close: function() {
            var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

            this._close.apply(this, args);

            this._cleanUpOldViews();

            return this;
        },
        showTransition: function(view, options) {
            var showOptions = this.setupTransitionOptions(options);
            var oldView = this.currentView;

            // Just show the view without any transition when the region is empty
            // and transitionWhenEmpty is false. This is false by default
            if (!showOptions.transtionWhenEmpty && !oldView) {
                this.show(view, showOptions);
                return this;
            }

            // If this view already exists and is the currentView,
            // prepare the region and animate the view in.
            if (view === oldView) {
                this.showSame(view, options);
                return this;
            }

            this.ensureEl();

            var isViewClosed = view.isClosed || _.isUndefined(view.$el);
            var isDifferentView = view !== this.currentView;

            this.preventClose =  !!showOptions.preventClose;

            view.render();
            this._triggerViewEvent(view, 'before:show');

            if (isDifferentView || isViewClosed) {
                this.addViewToDom(view);
                this._triggerRepaint();
            }

            this.prepareRegion(view, oldView, showOptions);

            $.when(this.transition(view, oldView, showOptions))
                .then(_.bind(function() {
                    this._cleanUpOldViews();
                    this._resetViews(view);
                }, this));

            this._triggerViewEvent(view, 'show');

            return this;
        },
        closeTransition: function(options) {
            var view = this.currentView;
            var closeOptions = this.setupTransitionOptions(options);

            if (!view || view.isClosed) {
                return;
            }

            function onComplete() {
                /*jshint validthis:true */
                this._cleanUpOldViews();
                Marionette.triggerMethod.call(this, 'close');
                this.setup();
                delete this.currentView;
            }

            this.prepareCommonOptions(closeOptions);
            this.prepareOldView(view, closeOptions);

            $.when(this.transition(null, view, closeOptions))
                .then(_.bind(onComplete, this));
        },
        hideTransition: function(options) {
            var view = this.currentView;
            var closeOptions = this.setupTransitionOptions(options);

            if (!view || view.isClosed) {
                return;
            }

            this.preventClose = true;

            this.prepareCommonOptions(closeOptions);
            this.prepareOldView(view, closeOptions);

            $.when(this.transition(null, view, closeOptions));
        },
        push: function(view, options) {
            this.ensureEl();

            var pushOptions = this.setupTransitionOptions(options);

            pushOptions.push = true;

            this.preventClose = true;

            var oldView = this.currentView;

            view.render();
            this._triggerViewEvent(view, 'before:show');
            this._triggerViewEvent(view, 'before:push');

            this.addViewToDom(view);
            this._triggerRepaint();

            this.prepareRegion(view, oldView, pushOptions);

            $.when(this.transition(view, oldView, pushOptions));

            this._triggerViewEvent(view, 'show');
            this._triggerViewEvent(view, 'push');

            this.addView(view);

            return this;
        },
        pop: function(options) {
            if (this.currentViewIndex <= 0 || this.viewStack.length <= 1) {
                return this;
            }

            this.ensureEl();

            var popOptions = this.setupTransitionOptions(options);

            popOptions.pop = true;

            this.preventClose = false;

            var oldView = this.currentView;
            var newView = this.viewStack[this.currentViewIndex - 1];

            this._triggerViewEvent(newView, 'before:show');
            this._triggerViewEvent(newView, 'before:pop');

            this.prepareRegion(newView, oldView, popOptions);

            $.when(this.transition(newView, oldView, popOptions));

            this._triggerViewEvent(newView, 'show');
            this._triggerViewEvent(newView, 'pop');

            this.removeView();

            return this;
        },
        showSame: function(view, options) {
            this.prepareRegion(view, null, options);
            $.when(this.transition(view, null, options));
            return this;
        },
        prepareRegion: function(newView, oldView, options) {
            this.prepareCommonOptions(options);
            this.prepareRegionContainer();
            if (newView && newView.$el) {
                this.prepareNewView(newView, options);
            }
            if (oldView && oldView.$el) {
                this.prepareOldView(oldView, options);
            }
        },
        transition: function(newView, oldView, options) {
            var wrapperDeferred = $.Deferred();
            var dfds = [];
            var self = this;

            function transition() {
                if (!newView) {
                    dfds[0] = true;
                }
                else {
                    dfds[0] = $.Deferred();
                    self.transitionIn(newView, options)
                        .done(function() {
                            dfds[0].resolve();
                        });
                }

                if (!oldView) {
                    dfds[1] = true;
                }
                else {
                    dfds[1] = $.Deferred();
                    self.transitionOut(oldView, options)
                        .done(function() {
                            dfds[1].resolve();
                        });
                }

                /*jshint validthis:true */
                return $.when.apply($, dfds)
                            .done(_.bind(function() {
                                wrapperDeferred.resolve();
                            }, this));
            }

            function delay() {
                /*jshint validthis:true */
                _.delay(_.bind(transition, this), 50);
            }

            // Don't worry too much about this mess.
            // It only exists so that Safari (mainly iOS) doesn't give me problems.
            // Basically, after deferring execution, then delaying 50ms
            // the local transition function is called which handles the transition magic.
            _.defer(_.bind(delay, this));

            return wrapperDeferred.done(_.bind(function() {
                this.onComplete(newView, oldView, options);
            }, this));
        },
        transitionIn: function(view, options) {
            var deferred = $.Deferred();

            this.enterAnimation(view, options)
                .eventCallback('onComplete', function() {
                    deferred.resolve();
                })
                .play();

            return deferred;
        },
        transitionOut: function(view, options) {
            var deferred = $.Deferred();

            this.exitAnimation(view, options)
                .eventCallback('onComplete', function() {
                    deferred.resolve();
                })
                .play();

            return deferred;
        },
        prepareCommonOptions: function(options) {
            options.distance = this.$el.width() + 30;

            if (options.distance < 600) {
                options.duration = 0.4;
            }
            else {
                options.duration = 0.5;
            }
        },
        prepareRegionContainer: function() {
        },
        prepareNewView: function(view, options) {
            var setOptions = {};

            view.$el.addClass('mt-view');

            if (options.direction === 'backward' || options.pop) {
                _.extend(setOptions, { 'x': '-80' });
            } else {
                _.extend(setOptions, { 'x': options.distance });
            }

            TweenLite.set(view.$el, setOptions);
        },
        prepareOldView: function(view, options) {
            var setOptions = {};

            view.$el.addClass('mt-view');

            if (options.direction === 'backward' || options.pop) {
                _.extend(setOptions, { 'z-index': '2' });
            }

            TweenLite.set(view.$el, setOptions);
        },
        addViewToDom: function(view) {
            this.$el.append(view.el);
        },
        enterAnimation: function(view, options) {
            if (_.isFunction(options.enterAnimation)) {
                return _.bind(options.enterAnimation(), this)();
            }

            return horizontalSlideToPosition(view.$el, 0, options);
        },
        exitAnimation: function(view, options) {
            if (_.isFunction(options.exitAnimation)) {
                return _.bind(options.exitAnimation(), this)();
            }

            if (options.pop || options.direction === 'backward') {
                return horizontalSlideToPosition(view.$el, options.distance, options);
            } else {
                return horizontalSlideToPosition(view.$el, -80, _.extend(options, { opacity: '0' }));
            }
        },
        addView: function(view) {
            this.viewStack.push(view);
            this.currentViewIndex++;
        },
        removeView: function(index) {
            index = index || this.viewStack.length - 1;
            this.viewStack.splice(index, 1);
            this.currentViewIndex--;
        },
        onComplete: function(newView, oldView, options) {
            if (newView) {
                this.attachView(newView);
                this._triggerViewEvent(newView, 'transition:end');
                this._triggerViewEvent(newView, 'transition:end:in');
            }

            if (oldView) {
                this._triggerViewEvent(oldView, 'transition:end');
                this._triggerViewEvent(oldView, 'transition:end:out');

                if (!this.preventClose) {
                    oldView.close();
                }
            }

            if (_.isFunction(options.onComplete)) {
                options.onComplete();
            }
        },
        setupTransitionOptions: function(options) {
            var opts = _.clone(options) || {};

            _.defaults(opts, {
                direction: 'forward',
                enterAnimation: null,
                exitAnimation: null,
                onStart: null,
                onComplete: null,
                transtionWhenEmpty: false
            });

            return opts;
        },
        _cleanUpOldViews: function() {
            _.each(this.viewStack, function(view) {
                view.close();
            });
        },
        _resetViews: function(view) {
            this.viewStack = [view];
            this.currentViewIndex = 0;
        },
        _triggerRepaint: function() {
            return this.$el.get(0).offsetHeight;
        },
        _triggerViewEvent: function(view, evtName) {
            Marionette.triggerMethod.call(this, evtName, view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod(evtName);
            } else {
                Marionette.triggerMethod.call(view, evtName);
            }
        },
        _show: function() {
            var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
            return Marionette.Region.prototype.show.apply(this, args);
        },
        _close: function() {
            var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
            return Marionette.Region.prototype.close.apply(this, args);
        }
    });

    return MarionetteTransition;
});
