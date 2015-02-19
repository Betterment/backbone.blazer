var _ = require('underscore'),
    $ = require('jquery'),
    Backbone = require('backbone');

Backbone.$ = $;

var Marionette = require('backbone.marionette'),
    Blazer = require('./backbone.blazer');

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Backbone.Blazer.Router', function() {
    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();

        var TestRoute = Backbone.Blazer.Route.extend({
            render: function() {}
        });

        var testRoute = this.testRoute = new TestRoute();
        sinon.spy(this.testRoute, 'render');

        var TestRouter = Backbone.Blazer.Router.extend({
            routes: {
                'route': testRoute
            }
        });
        this.router = new TestRouter();
        sinon.spy(this.router, 'handleRoute');

        window.location = Backbone.history.location = location;
        Backbone.history.start({ pushState: true });
    });

    afterEach(function() {
        Backbone.history.stop();
        this.sandbox.restore();
    });

    it('should work', function() {
        history.pushState({}, null, 'http://example.org/route');
        expect(location.pathname).to.equal('/route');

    });
});
