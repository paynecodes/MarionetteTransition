require(['app', 'backbone.marionette', 'Fade', 'text!apps/modal/show/templates/modal.html', 'text!apps/modal/fade_content/templates/page.html'], function(App, Marionette, Fade, modalTpl, fadeContentTpl) {
    'use strict';
    var Show;

    Show = App.module('ModalApp.Show');

    Show.FadeContent = Marionette.ItemView.extend({
        template: _.template(fadeContentTpl),
        events: {
            'click .show-fade': 'showFade'
        },
        initialize: function() {
            this.randomColor = pastelColors();
        },
        onRender: function() {
            this.$el.css('background-color', this.randomColor);
        },
        showFade: function() {
            App.trigger('show:modal:content');
        }
    });

    Show.Modal = Marionette.Layout.extend({
        template: _.template(modalTpl),
        events: {
            'click .close': 'closeModal'
        },
        regions: {
            fadeRegion: {
                selector: '.fade',
                regionType: Fade
            }
        },
        closeModal: function() {
            App.trigger('close:modal');
        }
    });

    function pastelColors(){
        var r = (Math.round(Math.random()* 127) + 127).toString(16);
        var g = (Math.round(Math.random()* 127) + 127).toString(16);
        var b = (Math.round(Math.random()* 127) + 127).toString(16);
        return '#' + r + g + b;
    }

    return Show;

});
