require(['app', 'backbone.marionette'], function(App, Marionette) {
    'use strict';

    var Show;

    Show = App.module('HomeApp.Show');

    Show.Controller = Marionette.Controller.extend({
        showHome: function(options) {
            options = options || {};

            var view = this._getHomeView();
            var headerView = this._getHeaderView();

            this.bindListeners(view);

            var dfd = $.Deferred();

            if (options.show) {
                App.mainRegion.show(view, options);
                App.headerRegion.show(headerView, options);
                return;
            }

            if (options.onlyMain && !options.push && !options.pop) {
                return App.mainRegion.showTransition(view, options);
            }

            if (options.push) {
                if (options.onlyMain) App.mainRegion.push(view, options);
                else {
                    App.mainRegion.push(view, options);
                    App.headerRegion.push(headerView, options);
                }
            }
            else if (options.pop) {
                if (options.onlyMain) App.mainRegion.pop(options);
                else {
                    App.mainRegion.pop(options);
                    App.headerRegion.pop(options);
                }
            }
            else {
                App.mainRegion.showTransition(view, options);
                App.headerRegion.showTransition(headerView, options);
            }

        },
        _getHomeView: function() { return new Show.Home },
        _getHeaderView: function() { return new Show.Header },
        bindListeners: function(view) {
            this.listenTo(view, 'before:show', function() {
                console.log('before:show');
            });
            this.listenTo(view, 'show', function() {
                console.log('show');
            });
            this.listenTo(view, 'close', function() {
                console.log('close', view.cid);
            });
            this.listenTo(view, 'push', function() {
                console.log('push');
            });
            this.listenTo(view, 'pop', function() {
                console.log('pop');
            });
            this.listenTo(view, 'before:push', function() {
                console.log('before:push');
            });
            this.listenTo(view, 'before:pop', function() {
                console.log('before:pop');
            });
            this.listenTo(view, 'transition:end', function() {
                console.log('transition:end', view.cid);
            });
            this.listenTo(view, 'transition:end:in', function() {
                console.log('transition:end:in', view.cid);
            });
            this.listenTo(view, 'transition:end:out', function() {
                console.log('transition:end:out', view.cid);
            });
        }
    });

    return Show;

});
