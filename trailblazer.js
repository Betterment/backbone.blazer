;(function (root, factory) {
    // https://github.com/umdjs/umd/blob/master/returnExports.js
    if (typeof exports === 'object') {
        // Node
        module.exports = factory(require('underscore'), require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], factory);
    } else {
        // Browser globals (root is window)
        factory(root._, root.Backbone, root);
    }
})(this, function (_, Backbone, root) {
    'use strict';

    Backbone.Trailblazer.Route = Backbone.Marionette.Object.extend({});

    Backbone.Trailblazer.Router = Backbone.Router.extend({
        route: function(route, config) {
            if (!_.isRegExp(route)) {
                route = this._routeToRegExp(route);
            }

            var routeData = {
                handler: config
            };

            var router = this;
            Backbone.history.route(route, function(fragment) {
                routeData.params = router._extractParameters(route, fragment);
                router.handleRoute(routeData);
            });
            return this;
        },

        handleRoute: function(routeData) {
            var handler = routeData.handler;

            if (_.isString(handler)) {
                if (_.isFunction(this[handler])) {
                    this[handler].apply(this, routeData);
                }
            } else if (handler instanceof Backbone.Trailblazer.Route) {
                this._handleBaseRoute(handler, routeData);
            } else if (_.isFunction(handler)) {
                handler.apply(this, routeData);
            } else {
                throw new Error('Incorrectly configured route');
            }
        },

        _handleBaseRoute: function(handler, routeData) {
            var router = this;

            handler.trigger('before:render');

            if (_.isFunction(handler.prepare)) {
                handler.prepare(routeData).then(function() {
                    // TODO: make sure that everything is kosher
                    // are we still on the originally requested route?
                    handler.render(routeData);
                }).fail(function() {
                    var args = Array.prototype.slice.call(arguments);

                    if (_.isFunction(handler.error)) {
                        var errorHandled = handler.error.apply(handler, args) === false;
                        if (!errorHandled) {
                            router.trigger('error', args);
                        }
                    }
                });
            } else {
                handler.render(routeData);
            }

            handler.trigger('after:render');
        }
    });

    return Backbone.Trailblazer;
});
