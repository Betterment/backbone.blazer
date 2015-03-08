var Route = Backbone.Blazer.Route.extend({
    prepare: function(routData) {
        console.log('Route prepare was called');
        return $.Deferred().resolve().promise();
    },
    execute: function(routeData) {
        console.log('Route route matched', routeData);
    }
});

var RouteThatErrors = Backbone.Blazer.Route.extend({
    prepare: function(routeData) {
        console.log('RouteThatErrors prepare was called');
        return $.Deferred().reject('error message').promise();
    },
    error: function(routeData, error) {
        console.log('RouteThatErrors route error triggered', routeData, error);
    }
});

var RouteWithFilter = Backbone.Blazer.Route.extend({
    filters: [{
        beforeRoute: function(routeData) {
            console.log('RouteWithFilter beforeRoute', routeData);
        },
        afterRoute: function(routeData) {
            console.log('RouteWithFilter afterRoute', routeData);
        }
    }],

    prepare: function(routeData) {
        console.log('RouteWithFilter prepare', routeData);
    },

    execute: function(routeData) {
        console.log('RouteWithFilter execute', routeData);
    }
});

var Router = Backbone.Blazer.Router.extend({
    routes: {
        'examples/basic/function': function(routeData) {
            console.log('Function route matched', routeData);
        },
        'examples/basic/method': 'method',
        'examples/basic/routeObject': new Route(),
        'examples/basic/routeObjectError': new RouteThatErrors(),
        'examples/basic/routeFilters': new RouteWithFilter()
    },
    method: function(routeData) {
        console.log('Method route matched', routeData);
    }
});

var router = new Router();

Backbone.history.start();
