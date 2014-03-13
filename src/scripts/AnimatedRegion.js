define(['jquery', 'underscore', 'transitioner'], function($, _, Transitioner) {
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
                if (options.beforeAnimate) options.beforeAnimate.done(function() {
                    Transitioner.startTransition(options.animatingEl);
                });
                else Transitioner.startTransition(options.animatingEl);
            });

            newView.$el.addClass(transInClasses);
            currentView.$el.addClass(transOutClasses);

            currentView.trigger('willTransition');

            newView.render();

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
    function setupOptionsDefaults(newView, options) {
        var self = this;
        options = _.clone(options) || {};
        options = _.defaults(options, {
            type: 'slide',
            direction: 'left',
            animatingEl: self.$el,
            beforeAnimate: null,
            transitionEndCb: null
        });
        return options;
    }

    function transition(newView, currentView, options) {
        Transitioner.transition(newView.$el, currentView.$el, options);
    }

    return AnimatedRegion;
});