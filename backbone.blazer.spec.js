var jsdom = require('jsdom').jsdom;
global.document = jsdom('');
global.window = global.document.defaultView;
global.navigator = global.window.navigator = {
  userAgent: 'NodeJS JSDom',
  appVersion: ''
};

var _ = require('underscore'),
    $ = require('jquery'),
    Backbone = require('backbone');
Backbone.$ = $;

var Marionette = require('backbone.marionette'),
    Blazer = require('./backbone.blazer');

var Location = function(href) {
    this.replace(href);
};
_.extend(Location.prototype, {

    parser: document.createElement('a'),

    replace: function(href) {
        this.parser.href = href;
        _.extend(this, _.pick(this.parser,
                'href',
                'hash',
                'host',
                'search',
                'fragment',
                'pathname',
                'protocol'
                ));
        // In IE, anchor.pathname does not contain a leading slash though
        // window.location.pathname does.
        if (!/^\//.test(this.pathname)) this.pathname = '/' + this.pathname;
    },

    toString: function() {
        return this.href;
    }

});

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Backbone.Blazer.Router', function() {
    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();

        var TestRoute = Backbone.Blazer.Route.extend({
            execute: function() {}
        });

        var testRoute = this.testRoute = new TestRoute();
        sinon.spy(this.testRoute, 'execute');

        var TestRouter = Backbone.Blazer.Router.extend({
            routes: {
                'route': testRoute
            }
        });
        this.router = new TestRouter();
        sinon.spy(this.router, 'handleRoute');

        Backbone.history.start({ pushState: true });
    });

    afterEach(function() {
        Backbone.history.stop();
        this.sandbox.restore();
    });

    it('should work', function() {
        this.router.navigate('route', { trigger: true });
        expect(this.testRoute.execute).to.have.been.calledOnce;
    });
});
