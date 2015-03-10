// ========================== Backbone.BaseRoute start ==========================
// @include node_modules/backbone.base-router/src/backbone.base-router.js
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

        this._runBeforeFilters(route, routeData).then(function() {
            return route.prepare(routeData);
        }).then(function() {
            if (router.currentRoute !== route) {
                return;
            }

            route.execute(routeData);
            route.trigger('after:execute', routeData);

            router._runAfterFilters(route, routeData);
        }).fail(function() {
            if (router.currentRoute !== route) {
                return;
            }

            var args = Array.prototype.slice.call(arguments);
            args.unshift(routeData);

            var errorHandled = route.error.apply(route, args) === true;

            if (!errorHandled) {
                router.trigger('error', args);
            }
        });
    },

    _runBeforeFilters: function(route, routeData) {
        return this._runFilters('beforeRoute', route, routeData);
    },

    _runAfterFilters: function(route, routeData) {
        return this._runFilters('afterRoute', route, routeData);
    },

    _runFilters: function(which, route, routeData) {
        var filters = (this.filters || []).concat(route.filters || []),
            stageFilters = _.compact(_.pluck(filters, which)),
            def = $.Deferred();

        var chain = _.reduce(stageFilters, function(previous, filter) {
            if (!previous) {
                return $.when(filter(routeData));
            }

            return previous.then(function() {
                return filter(routeData);
            });
        }, null);

        if (chain) {
            chain.then(def.resolve);
        } else {
            def.resolve();
        }

        return def.promise();
    }
});
