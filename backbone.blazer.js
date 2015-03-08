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
            var errorHandled = route.error.apply(route, args) === true;
            if (!errorHandled) {
                router.trigger('error', args);
            }
        });
    }
});
