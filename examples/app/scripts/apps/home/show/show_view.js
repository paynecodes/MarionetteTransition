require(['app', 'backbone.marionette', 'text!apps/home/show/templates/_header.html', 'text!apps/home/show/templates/page.html'], function(App, Marionette, headerTpl, pageTpl) {
    'use strict';
    var Show;

    Show = App.module('HomeApp.Show');

    Show.Header = Marionette.ItemView.extend({
        template: _.template(headerTpl),
        events: {
            'click .show-modal': 'showModal'
        },
        showModal: function(e) {
            e.preventDefault();
            App.trigger('show:modal', { transtionWhenEmpty: true });
        }
    });

    Show.Home = Marionette.Layout.extend({
        template: _.template(pageTpl),
        className: 'home',
        events: {
            'click .slideLeft': 'slideLeft',
            'click .push': 'pushView',
            'click .pop': 'popView',
            'click .only-page': 'onlyPage',
            'click .only-page-push': 'onlyPagePush',
            'click .only-page-pop': 'onlyPagePop',
            'click .show': 'normalShow'
        },
        initialize: function() {
            this.randomColor = pastelColors();
        },
        onRender: function() {
            this.$el.css('background-color', this.randomColor);
        },
        slideLeft: function() {
            App.trigger('show:home');
        },
        pushView: function() {
            App.trigger('show:home', {
                push: true
            });
        },
        popView: function() {
            App.trigger('show:home', {
                pop: true
            });
        },
        onlyPage: function() {
            App.trigger('show:home', {
                onlyMain: true
            });
        },
        onlyPagePush: function() {
            App.trigger('show:home', {
                onlyMain: true,
                push: true
            });
        },
        onlyPagePop: function() {
            App.trigger('show:home', {
                onlyMain: true,
                pop: true
            });
        },
        normalShow: function() {
            App.trigger('show:home', {
                show: true
            });
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
