define(['jquery', 'underscore', 'backbone.marionette', 'transitioner'], function($, _, Marionette, Transitioner) {
    'use strict';

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
                Marionette.triggerMethod.call(newView, "after:transition");
                Marionette.triggerMethod.call(this, "after:transition", newView);
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

                Marionette.triggerMethod.call(newView, "after:transition");
                Marionette.triggerMethod.call(this, "after:transition", newView);

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
