define(['jquery', 'underscore', 'backbone.marionette', 'gsap.tweenlite', 'gsap.cssplugin', 'animations/horizontalSlideToPosition'], function($, _, Marionette, TweenLite, CSSPlugin, horizontalSlideToPosition) {
    'use strict';

    var MarionetteTransition = Marionette.Region.extend({
        initialize: function(options) {
            this.views = [];
            this.currentViewIndex = -1;
        },
        showTransition: function(view, options) {
            this.ensureEl();

            var showOptions = options || {};
            var isViewClosed = view.isClosed || _.isUndefined(view.$el);
            var isDifferentView = view !== this.currentView;

            this.preventClose =  !!showOptions.preventClose;

            // only close the view if we don't want to preventClose and the view is different
            var _shouldCloseView = !this.preventClose && isDifferentView;

            view.render();
            this._triggerBeforeShow(view);

            this.addViewToDom(view);
            this._triggerRepaint();

            var transition = this.transitionToView(view, this.currentView, showOptions);
            transition.done(_.bind(function() {
                console.log('cleaning up views');
                this._cleanUpViews();
            }, this));

            this.currentView = view;

            this._triggerShow(view);

            return this;
        },
        push: function(view, options) {
            this.ensureEl();

            var pushOptions = options || {};

            pushOptions.push = true;

            this.preventClose = true;
            var _shouldCloseView = this.preventClose;

            view.render();
            this._triggerBeforeShow(view);
            this._triggerBeforePush(view);

            this.addViewToDom(view);
            this._triggerRepaint();

            this.transitionToView(view, this.currentView, pushOptions);

            this.currentView = view;

            this._triggerShow(view);
            this._triggerPush(view);

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

            var currentView = this.currentView;
            var newView = this.views[this.currentViewIndex - 1];

            this._triggerBeforeShow(newView);
            this._triggerBeforePop(newView);

            this.transitionToView(newView, currentView, popOptions);

            this.currentView = newView;

            this._triggerShow(newView);
            this._triggerPop(newView);

            this.removeView();

            return this;
        },
        transitionToView: function(newView, currentView, options) {
            this.prepareCommonOptions(options);
            this.prepareRegionContainer();
            this.prepareNewView(newView, options);
            if (currentView && currentView.$el) {
                this.prepareCurrentView(currentView, options);
            }

            var self = this;
            var deferred = $.Deferred();

            _.defer(function() {
                _.delay(transition, 20);
            });

            function transition() {
                var enterAnimation = self.enterAnimation(newView, options);

                if (currentView && currentView.$el) {
                    enterAnimation.eventCallback('onStart', function() {
                        self.exitAnimation(currentView, options);
                    });
                }

                enterAnimation.eventCallback('onComplete', function() {
                    self._triggerTransitionEnd(newView);
                    if (currentView && !self.preventClose) currentView.close();
                    deferred.resolve();
                });
            }

            return deferred;
        },
        prepareCommonOptions: function(options) {
            options.distance = this.$el.width();
            options.duration = .4;
        },
        prepareRegionContainer: function() {
            this.$el.css({
                'position': 'relative'
            })
        },
        prepareNewView: function(view, options) {
            view.$el.css({
                'position': 'absolute',
                'width': '100%',
                'transform': 'matrix(1, 0, 0, 1,' + options.distance + ', 0)',
                '-webkit-transform': 'matrix(1, 0, 0, 1,' + options.distance + ', 0)',
                '-moz-transform': 'matrix(1, 0, 0, 1,' + options.distance + ', 0)',
                '-ms-transform': 'matrix(1, 0, 0, 1,' + options.distance + ', 0)',
                '-o-transform': 'matrix(1, 0, 0, 1,' + options.distance + ', 0)'
            });
        },
        prepareCurrentView: function(view, options) {
            view.$el.css({
                'position': 'absolute',
                'width': '100%'
            });
        },
        addViewToDom: function(view) {
            this.$el.append(view.el);
        },
        enterAnimation: function(view, options) {
            return horizontalSlideToPosition(view.$el, 0, options);
        },
        exitAnimation: function(view, options) {
            if (options.pop) {
                return horizontalSlideToPosition(view.$el, options.distance, options);
            } else {
                return horizontalSlideToPosition(view.$el, -150, _.extend(options, { opacity: "0" }))
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
        _cleanUpViews: function() {
            _.each(this.views, function(view, index) {
                view.close();
            });

            this.views = [this.currentView];
            this.currentViewIndex = 0;
        },
        _triggerRepaint: function() {
            this.$el.get(0).offsetHeight;
        },
        _triggerBeforeShow: function(view) {
            Marionette.triggerMethod.call(this, "before:show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:show");
            } else {
                Marionette.triggerMethod.call(view, "before:show");
            }
        },
        _triggerShow: function(view) {
            Marionette.triggerMethod.call(this, "show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("show");
            } else {
                Marionette.triggerMethod.call(view, "show");
            }
        },
        _triggerBeforePush: function(view) {
            Marionette.triggerMethod.call(this, "before:push", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:push");
            } else {
                Marionette.triggerMethod.call(view, "before:push");
            }
        },
        _triggerPush: function(view) {
            Marionette.triggerMethod.call(this, "push", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("push");
            } else {
                Marionette.triggerMethod.call(view, "push");
            }
        },
        _triggerBeforePop: function(view) {
            Marionette.triggerMethod.call(this, "before:pop", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:pop");
            } else {
                Marionette.triggerMethod.call(view, "before:pop");
            }
        },
        _triggerPop: function(view) {
            Marionette.triggerMethod.call(this, "pop", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("pop");
            } else {
                Marionette.triggerMethod.call(view, "pop");
            }
        },
        _triggerTransitionEnd: function(view) {
            Marionette.triggerMethod.call(this, "transition:end", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("transition:end");
            } else {
                Marionette.triggerMethod.call(view, "transition:end");
            }
        }
    });

    return MarionetteTransition;
});
