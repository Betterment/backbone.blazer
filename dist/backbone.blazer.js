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

    // ========================== Backbone.BaseRoute state ==========================
    //
    // Backbone.BaseRouter
    //
    
    // This is copied over from Backbone, because it doesn't expose it
    var NAMED_PARAM = /(\(\?)?:\w+/g;
    // Find plus symbols
    var PLUS_SYMBOL = /\+/g;
    
    Backbone.BaseRouter = Backbone.Router.extend({
      constructor: function() {
        this.routeParams = {};
        Backbone.Router.prototype.constructor.apply(this, arguments);
      },
    
      // The single point of entry. This is called whenever a
      // route is matched. The routeData argument contains lots of
      // useful information.
      onNavigate: function(routeData) {},
    
      route: function(origRoute, linked) {
        var route, routeStr;
    
        if (_.isRegExp(origRoute)) {
          route = origRoute;
          routeStr = '' + origRoute;
        } else {
          route = this._routeToRegExp(origRoute);
          routeStr = origRoute;
        }
    
        this.routeParams[origRoute] = this._extractRouteParams(routeStr);
    
        // Begin setting up our routeData,
        // based on what we already know.
        var routeData = {
          route: route,
          router: this,
          linked: linked
        };
    
        // Only attach the originalRoute to routeData if it isn't a RegExp.
        if (!_.isRegExp(origRoute)) {
          routeData.originalRoute = origRoute;
        }
    
        // Register a callback with history
        var router = this;
        Backbone.history.route(route, function(fragment, navOptions) {
          var routeParams = router._extractParameters(route, fragment);
          var queryString = routeParams.pop();
    
          // If the user is using baseHistory, then we'll get the navOptions back from BB.History
          if (navOptions) { routeData.navOptions = navOptions; }
          routeData.query = router._getQueryParameters(queryString);
          routeData.params = router._getNamedParams(routeStr, routeParams);
          routeData.uriFragment = fragment;
    
          router.onNavigate(routeData);
        });
    
        return this;
      },
    
      _extractRouteParams: function(route) {
        var namedParams = [];
    
        route.replace(NAMED_PARAM, function(match, optional) {
          namedParams.push(match.substr(1));
        });
    
        return namedParams;
      },
    
      // Decodes the Url query string parameters & and returns them
      // as an object. Supports empty parameters, but not array-like
      // parameters (which aren't in the URI specification)
      _getQueryParameters: function(queryString) {
        if (!queryString) { return {}; }
    
        return _.reduce(queryString.split('&'), function(memo, param) {
          var parts = param.replace(PLUS_SYMBOL, ' ').split('=');
          var key = parts[0];
          var val = parts[1];
    
          key = decodeURIComponent(key);
          val = val === undefined ? null : decodeURIComponent(val);
    
          // If we don't have the value, then we set it.
          if (!memo[key]) {
            memo[key] = val;
          }
    
          // Otherwise, if we have the value, and it's an array,
          // then we push to it.
          else if (_.isArray(memo[key])) {
            memo[key].push(val);
          }
    
          // Otherwise, we have a value that is not yet an array,
          // so we convert it to an array, adding the newest value.
          else {
            memo[key] = [memo[key], val];
          }
    
          return memo;
        }, {});
      },
    
      // Returns the named parameters of the route
      _getNamedParams: function(route, routeParams) {
        if (!routeParams.length) { return {}; }
    
        var routeKeys = this.routeParams[route];
        var routeValues = routeParams.slice(0, routeKeys.length);
    
        return _.object(_.zip(routeKeys, routeValues));
      }
    });
    
    // =========================== Backbone.BaseRoute end ===========================
    
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
        error: function() {}
    });
    
    Backbone.Blazer.Router = Backbone.BaseRouter.extend({
        onNavigate: function(routeData) {
            var handler = routeData.linked;
    
            this.currentRoute = handler;
    
            if (_.isString(handler) && _.isFunction(this[handler])) {
                this[handler].apply(this, routeData);
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
    
            $.when(route.prepare(routeData)).then(function() {
                if (router.currentRoute !== route) {
                    return;
                }
                route.execute(routeData);
                route.trigger('after:execute', routeData);
            }).fail(function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(routeData);
                if (router.currentRoute !== route) {
                    return;
                }
                var errorHandled = route.error.apply(route, args) === false;
                if (!errorHandled) {
                    router.trigger('error', args);
                }
            });
        }
    });
    
});
