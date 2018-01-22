# backbone.blazer

## Unsupported

We no longer use blazer and no longer maintain it, but are leaving the source code up for reference. Please feel free to fork the repo if it still has value to your team.

---

A better router for Backbone and Marionette applications

<a title='Build Status' href="https://travis-ci.org/Betterment/backbone.blazer">
  <img src='https://secure.travis-ci.org/Betterment/backbone.blazer.svg?branch=master' />
</a>
<a href='https://gitter.im/Betterment/backbone.blazer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge'>
  <img src='https://badges.gitter.im/Join%20Chat.svg' alt='Gitter Chat' />
</a>

learn more [here](https://docs.google.com/presentation/d/1MNgrFUsjFd-LUwukuc9I7iRr0jmspmSr97gyIO3PH2k/edit?usp=sharing) (presentation) and [here](http://youtu.be/F32QhaHFn1k) (video)

## installation

`bower install backbone.blazer`

```html
<script src='jquery.js'></script>
<script src='underscore.js'></script>
<script src='backbone.js'></script>
<script src='bower/path/to/backbone.blazer.js'></script>
<script src='app.js'></script>
```

## huh? what's this?
In order to build a modularized routing system, we've extended and overriden a few parts of the core `Backbone.Router`. This library attempts to be a **mostly** drop-in replacement for the normal Backbone router. However, we have removed a few things.

### what's in the box?
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

`Route` objects can do more than just view rendering. `Route` objects can also be configured to perform asynchronous actions **before** rendering your views (or really before calling your `execute` method).

For example, here's a route that loads some data from some Backbone Model before rendering a view:

```js
var LoadSomeDataRoute = Backbone.Blazer.Route.extend({
  prepare: function(routeData) {
    routeData.someData = new SomeData();
    return routeData.someData.fetch();
  },
  execute: function(routeData) {
    App.getRegion('main').show(new SomeDataView({ model: routeData.someData }));
  }
});
```

The Blazer router expects the `prepare` method to return a promise. If the promise is resolved as a success, then the `execute` method is called; otherwise, the route's `error` method is called (if provided).

# Filters

## Configuration
Both `Router` and `Route` objects can define filters that run before and after a route is invoked.
Filters are specified as an array of objects, where each object has a `beforeRoute` and/or `afterRoute` functions.
```js
var FilteredRoute = Backbone.Blazer.Route.extend({
  filters: [{
    beforeRoute: function() {
      // I run before my prepare() method is called
    },
    
    afterRoute: function() {
      // I run after my execute() method is called
    }
  }]
});

var Router = Backbone.Blazer.Router.extend({
  routes: {
    'route1': new FilteredRoute(),
    'route2': new OtherRoute()
  },

  filters: [{
    beforeRoute: function() {
      // I run before prepare() is called on all routes
    },
    
    afterRoute: function() {
      // I run after execute() is called on all routes
    }
  }]
});

```

## Ordering
Filters will run in the order they are sepcified in the `filters` array. A filter that needs to do some asynchronous work can return a promise and the next filter in the chain will not be run until that promise is resolved. Because of this, it is safe to mix filters that do synchronous work with filters that do asynchronous work.

Filters on a `Router` object will be run for all `Route` objects on that router. When invoking a specific route, the router's filters will all run before filters on the route in question are run.

## Halting Execution
If a filter returns a promise and that promise is rejected or simply never resolves, the filter chain will stop executing and subsequent filters in the chain will not be invoked. In the case of before filters the `prepare()` function will never be invoked.

# Redirecting
You can stop redirect to another route at any point during route invokation. Doing this will stop execution of the current route. For instance, if a `beforeRoute` filter redirects then `prepare` and `execute` will not be invoked for the current route. Similarly, if `prepare` redirects then `execute` will not be invoked for the current route.

```js
var Route = Backbone.Blazer.Route.extend({
  filters: [{
    beforeRoute: function() {
      if (somethingBadHappened()) {
        return this.redirect('another_route');
      }
    }
  }]
});
```

# API

## `Backbone.Blazer.Router`
### events
 - `before:execute`, with payload `[routeData]`. this is the first thing that happens when processing a route.
 - `after:execute`, with payload `[routeData]`. this is the last thing called when processing a route. **only** called if execute was actually called.
 - `error`, with payload `[routeData, argsFromRejectedPromise]`

The router accepts the same parameters as the normal [`Backbone.Router`](http://backbonejs.org/#Router).

The entries in the `routes` hash can contain any of the following:
- a callback function in the form: `function(routeData) {}`
- a router method in the form: `function(routeData) {}`
- a `Backbone.Blazer.Route` object

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
 - returning `true` will prevent the router from bubbling the error back up through itself to the application.

### `#redirect(fragment)`
 - return this from within any `beforeRoute`, `afterRoute`, `prepare`, `execute` or `error` function and execution for this route will stop immediately and a new route corresponding to the provided fragment will be invoked.

--

# Legal Schtuff (MIT License)
Any contributions made to this project are covered under the MIT License, found [here](LICENSE)
