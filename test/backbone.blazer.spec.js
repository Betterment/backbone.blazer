describe('Backbone.Blazer.Router', function() {

    var TestRoute = Backbone.Blazer.Route.extend({
        execute: function() {}
    });

    var TestRouter = Backbone.Blazer.Router.extend();

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();

        this.testRoute = new TestRoute();

        this.router = new TestRouter();
        this.router.route('route', this.testRoute);
        sinon.spy(this.router, 'handleRoute');

        Backbone.history.location = new Location('http://example.org');
        Backbone.history.start({ pushState: true });
    });

    afterEach(function() {
        Backbone.history.stop();
        this.sandbox.restore();
    });

    it('should process a route correctly', function() {
        sinon.spy(this.testRoute, 'prepare');
        sinon.spy(this.testRoute, 'execute');
        sinon.spy(this.testRoute, 'error');

        this.router.navigate('route', { trigger: true });

        expect(this.router.handleRoute).to.have.been.calledOnce;
        expect(this.testRoute.prepare).to.have.been.calledOnce;
        expect(this.testRoute.execute).to.have.been.calledOnce;
        expect(this.testRoute.error).to.not.have.been.called;
    });

    it('should process an error correctly', function() {
        sinon.stub(this.testRoute, 'prepare', function() { return $.Deferred().reject().promise(); });
        sinon.spy(this.testRoute, 'execute');
        sinon.spy(this.testRoute, 'error');

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.prepare).to.have.been.calledOnce;
        expect(this.testRoute.execute).to.not.have.been.called;
        expect(this.testRoute.error).to.have.been.calledOnce;
    });
});
