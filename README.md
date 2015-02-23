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

In addition to the **old** way of routing, Blazer provides a new strategy.
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

Now, that's not all that interesting really. What is interesting is that Blazer Route objects can be configured to perform asynchronous actions **before** rendering your views (or really before calling your `execute` method).

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

# Legal Schtuff (MIT License)
Any contributions made to this project are covered under the MIT Licence.
