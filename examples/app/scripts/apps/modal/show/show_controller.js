require(['app', 'backbone.marionette'], function(App, Marionette) {
    'use strict';

    var Show;

    Show = App.module('ModalApp.Show');

    Show.Controller = Marionette.Controller.extend({
        showModal: function(options) {
            options = options || {};

            if (!this.view) {
                this.view = this._getModalView();
                this.bindListeners(this.view);
            }

            this.listenTo(this.view, 'before:show', function() {
                this.showModalFadeContent(options);
            });

            if (!this.fadeContentView) {
                this.showModalFadeContent(options);
            }

            App.modalRegion.showTransition(this.view, options);
        },
        showModalFadeContent: function(options) {
            this.fadeContentView = this._getFadeContentView();
            this.view.fadeRegion.showTransition(this.fadeContentView);
        },
        closeModal: function(options) {
            options = options || {};
            App.modalRegion.hideTransition();
        },
        _getModalView: function() { return new Show.Modal },
        _getFadeContentView: function() { return new Show.FadeContent },
        bindListeners: function(view) {
            this.listenTo(view, 'before:show', function() {
                console.log('before:show');
            });
            this.listenTo(view, 'show', function() {
                console.log('show');
            });
            this.listenTo(view, 'close', function(view) {
                console.log('close');
                delete this.view;
                delete this.fadeContentView;
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
