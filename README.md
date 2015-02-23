# backbone.blazer
A better router for Backbone and Marionette applications

## huh? what's this?
In order to build a modularized routing system, we've extended and overriden a few parts of the core `Backbone.Router`. This library attempts to be a **mostly** drop-in replacement for the normal Backbone router. However, we have removed a few things.

### what's in the box?
#### removed
We've removed the triggering of events on the router when processing a route. These were never useful to us, and so we've gotten rid of them.

#### added
`Backbone.Blazer.Router` still supports the usual way of routing in a Backbone application: mapping a regexp to a callback. However, we've gone ahead and added a new way of configuring your routes: `Backbone.Blazer.Route`.


# Router Configuration
Blazer's router supports all the familiar configuration of `Backbone.Router`
```js
var MyRouter = Backbone.Blazer.Router.extend({
  routes: {
    'regular-old-route': function(routeData) {
      // do whatever you want
    }
  }
});
```

In addition to the **old** way of routing, Blazer provides a new strategy: using a `Route` object.
```js
var MyRouter = Backbone.Blazer.Router.extend({
  routes: {
    'new-hot-route': new HotRoute()
  }
});

var HotRoute = Backbone.Blazer.Route.extend({
  execute: function(routeData) {
    // the code that would normally go in your router callback can now go here
  }
});
```

In addition to using `Route` objects to do normal view rendering, `Route` objects can also be configured to perform asynchronous actions **before** rendering your views (or really before calling your `execute` method).

For example, here's a route that loads some data from some Backbone Model before rendering a view:

```js
var LoadSomeDataRoute = Backbone.Blazer.Route.extend({
  prepare: function(routeData) {
    this.someData = new SomeData();
    return this.someData.fetch();
  },
  execute: function(routeData) {
    App.getRegion('main').show(new SomeDataView({ model: this.someData }));
  }
});
```

The Blazer router expects the `prepare` method to return a promise. If the promise is resolved as a success, then the `execute` method is called; otherwise, the route's `error` method is called (if provided).

# API

## `Backbone.Blazer.Router`
### events
 - `error`, with payload `[routeData, argsFromRejectedPromise]`

## `Backbone.Blazer.Route`
### events
 - `before:execute`, with payload `[routeData]`. this is the first thing that happens when processing a route.
 - `after:execute`, with payload `[routeData]`. this is the last thing called when processing a route. **only** called if execute was actually called.
 
### `#prepare(routeData)`
 - returns a promise (default value is a successfully resolved promise)

### `#execute(routeData)`
 - called if the promise from `#prepare` resolves to success

### `#error(routeData, argumentsFromRejectedPromise)`
 - called if the promise from `#prepare` resolves to failure
 - returning false will prevent the router from bubbling the error back up through itself to the application.

TODO
 - consider replacing events that exist now with `Backbone.Radio` / `Backbone.Wreqr` request/response style pattern to make them more useful.

--

# Legal Schtuff (MIT License)
Any contributions made to this project are covered under the MIT License, found [here](LICENSE)
