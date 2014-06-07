define([
    'backbone.marionette',
    'app',
    'apps/modal/show/show_controller',
    'apps/modal/show/show_view'
], function(Marionette, App) {
    'use strict';

    var ModalApp, API;

    API = {
        showModal: function(options) {
            this._getController().showModal(options);
        },
        closeModal: function(options) {
            this._getController().closeModal(options);
        },
        showModalContent: function(options) {
            this._getController().showModalFadeContent();
        },
        _getController: function() {
            return this.controller = this.controller || new ModalApp.Show.Controller();
        }
    };

    ModalApp = App.module('ModalApp');
    ModalApp.startWithParent = true;

    App.on('show:modal', function(options) {
        API.showModal(options);
    });

    App.on('close:modal', function(options) {
        API.closeModal(options);
    });

    App.on('show:modal:content', function(options) {
        API.showModalContent(options);
    });

    return ModalApp;
});
