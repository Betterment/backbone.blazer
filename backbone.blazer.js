// the Backbone.Router internal way to extract named params from routes
var NAMED_PARAM = /(\(\?)?:\w+/g;

var RouterUtil = {
    extractQueryParameters: function(queryString) {
        var pairs;

        if (!_.isString(queryString)) {
            return {};
        }

        pairs = queryString.split('&');

        return _.reduce(pairs, function(memo, pair) {
            var kv = pair.split('='),
                key = decodeURIComponent(kv[0]),
                val = _.isUndefined(kv[1]) ? null : decodeURIComponent(kv[1]),
                currentVal = memo[key];

            //TODO: support objects
            // e.g. foo[bar]=1&foo[baz]=2
            if (_.isUndefined(currentVal)) {
                memo[key] = val;
            } else if (_.isArray(currentVal)) {
                memo[key].push(val);
            } else {
                memo[key] = val;
            }
        }, {});
    },

    extractNamedRouteParameters: function(routeString, rawRouteParams) {
        if (!_.isArray(rawRouteParams) || rawRouteParams.length < 1) {
            return {};
        }

        var keys = routeString.match(NAMED_PARAM) || [],
            vals = rawRouteParams.slice(0, keys.length);

        return _.object(_.zip(keys, vals));
    }
};

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

Backbone.Blazer.Router = Backbone.Router.extend({
    route: function(originalRoute, handlerConfig) {
        var routeRegex,
            routeString = '' + originalRoute,
            routeData = {};

        if (!_.isRegExp(originalRoute)) {
            routeRegex = this._routeToRegExp(originalRoute);
            routeData.originalRoute = originalRoute;
        } else {
            routeRegex = originalRoute;
        }

        routeData.router = this;
        routeData.route = routeRegex;
        routeData.handler = handlerConfig;

        var router = this;
        Backbone.history.route(routeRegex, function(fragment, options) {
            var rawRouteParams = router._extractParameters(routeRegex, fragment);
            var queryString = rawRouteParams.pop();

            routeData.query = RouterUtil.extractQueryParameters(queryString);
            routeData.params = RouterUtil.extractNamedRouteParameters(routeString, rawRouteParams);
            routeData.fragment = fragment;
            routeData.options = options;

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
