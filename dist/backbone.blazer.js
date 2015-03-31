// Backbone.Blazer v0.0.2
;(function (root, factory) {
    // https://github.com/umdjs/umd/blob/master/returnExports.js
    if (typeof exports === 'object') {
        // Node
        module.exports = factory(require('jquery'), require('underscore'), require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'underscore', 'backbone'], factory);
    } else {
        // Browser globals (root is window)
        factory(root.$, root._, root.Backbone, root);
    }
})(this, function ($, _, Backbone, root) {
    'use strict';

    Backbone.Blazer = {};
    
    Backbone.Blazer.Route = function(options) {
        this.options = _.extend({}, _.result(this, 'options'), options);
        this.initialize.apply(this, arguments);
    };
    
    Backbone.Blazer.Route.extend = Backbone.Model.extend;
    
    _.extend(Backbone.Blazer.Route.prototype, Backbone.Events, {
        initialize: function() {},
        destroy: function() {
            this.stopListening();
            return this;
        },
        prepare: function() {},
        execute: function() {},
        error: function() {},
        redirect: function(fragment) {
            return {
                redirectFragment: fragment
            };
        }
    });
    
    Backbone.Blazer.Router = Backbone.Router.extend({
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
    
            this.currentRoute = handler;
    
            if (_.isString(handler)) {
                if (_.isFunction(this[handler])) {
                    this[handler].apply(this, routeData.params);
                }
            } else if (handler instanceof Backbone.Blazer.Route) {
                this._handleBlazerRoute(handler, routeData);
            } else if (_.isFunction(handler)) {
                handler.apply(this, routeData);
            } else {
                throw new Error('Incorrectly configured route');
            }
        },
    
        _handleBlazerRoute: function(route, routeData) {
            var router = this;
    
            route.trigger('before:execute', routeData);
            router.trigger('before:execute', routeData);
    
            this._runBeforeFilters(router, route, routeData).then(function() {
                return router._runHandler(route.prepare, router, route, routeData);
            }).then(function() {
                if (router.currentRoute !== route) {
                    return;
                }
    
                router._runHandler(route.execute, router, route, routeData);
                route.trigger('after:execute', routeData);
                router.trigger('after:execute', routeData);
    
                router._runAfterFilters(router, route, routeData);
            }).fail(function() {
                if (router.currentRoute !== route) {
                    return;
                }
    
                var args = Array.prototype.slice.call(arguments);
                args.unshift(routeData);
    
                var errorHandled;
                router._runHandler(function(routeData) {
                    var result = route.error.apply(route, args);
                    errorHandled = result === true;
                    return result;
                }, router, route, routeData);
    
                if (!errorHandled) {
                    router.trigger('error', args);
                }
            });
        },
    
        _runBeforeFilters: function(router, route, routeData) {
            return this._runFilters('beforeRoute', router, route, routeData);
        },
    
        _runAfterFilters: function(router, route, routeData) {
            return this._runFilters('afterRoute', router, route, routeData);
        },
    
        _runFilters: function(which, router, route, routeData) {
            var filters = (this.filters || []).concat(route.filters || []),
                stageFilters = _.compact(_.pluck(filters, which)),
                def = $.Deferred();
    
            var chain = _.reduce(stageFilters, function(previous, filter) {
                
                if (!previous) {
                    return router._runHandler(filter, router, route, routeData);
                }
    
                return previous.then(function() {
                    return router._runHandler(filter, router, route, routeData);
                });
    
            }, null);
    
            if (chain) {
                chain.then(def.resolve);
            } else {
                def.resolve();
            }
    
            return def.promise();
        },
    
        _runHandler: function(handler, router, route, routeData) {
            var result = handler.call(route, routeData);
    
            if (result && result.redirectFragment) {
                router.navigate(result.redirectFragment, { trigger: true });
                return $.Deferred().reject().promise();
            }
    
            return $.when(result);
        }
    });
    
});
