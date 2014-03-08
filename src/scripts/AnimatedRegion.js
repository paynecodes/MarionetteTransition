define(['transitioner'], function(Transitioner) {
    'use strict';

    var _show = Marionette.Region.prototype.show,
         _slice = [].slice;

    function setupOptionsDefaults(newView, options) {
        var self = this;
        options = _.clone(options) || {};
        options = _.defaults(options, {
            type: 'slide',
            direction: 'left',
            transitionEndCb: function() {
                // clean up the old view
                self.close();
                self.currentView = newView;
                self.isAnimating = false;

                // do the things show would normally do after showing a new view
                Backbone.Marionette.triggerMethod.call(newView, "show");
                Backbone.Marionette.triggerMethod.call(self, "show", newView);
            }
        });
        return options;
    }

    var AnimatedRegion = Marionette.Region.extend({
        initialize: function() {
            // Listening to show here only once instead of using onShow
            // because the onShow function is called every time a view is rendered in it.
            this.listenToOnce(this, 'show', function() {
                this.$el.addClass('animated-region');
            });
        },
        show: function(newView, options) {
            // Do we have a view currently?
            var currentView = this.currentView,
                 args;

            if (this.isAnimating) return;

            args = 1 <= arguments.length ? _slice.call(arguments, 0) : [];

            // If we don't currently have a view, simply show the newView and exit
            if (!currentView || currentView.isClosed){
                _show.apply(this, args);
                return;
            } else this.transitionToView(newView, currentView, options);
        },
        transitionToView: function(newView, currentView, options) {
            var self = this;
            options = setupOptionsDefaults.call(this, newView, options);
            currentView.trigger('willTransition');
            this.stopListening(newView, 'render');
            this.listenTo(newView, 'render', function() {
                Transitioner.transition(newView.$el, currentView.$el, options);
            });
            this.isAnimating = true;
            newView.render();
        }
    });

    return AnimatedRegion;
});