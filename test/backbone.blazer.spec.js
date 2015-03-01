describe('Backbone.Blazer.Router', function() {

    var TestRoute = Backbone.Blazer.Route.extend({
        execute: function() {}
    });

    var TestRouter = Backbone.Blazer.Router.extend();

    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        this.testRoute = new TestRoute();

        this.router = new TestRouter();
        this.router.route('route', this.testRoute);
        this.sinon.spy(this.router, 'handleRoute');

        Backbone.history.location = new Location('http://example.org');
        Backbone.history.start({ pushState: true });
    });

    afterEach(function() {
        Backbone.history.stop();
        this.sinon.restore();
    });

    it('should process a route correctly', function() {
        this.sinon.spy(this.testRoute, 'prepare');
        this.sinon.spy(this.testRoute, 'execute');
        this.sinon.spy(this.testRoute, 'error');

        this.router.navigate('route', { trigger: true });

        expect(this.router.handleRoute).to.have.been.calledOnce;
        expect(this.testRoute.prepare).to.have.been.calledOnce;
        expect(this.testRoute.execute).to.have.been.calledOnce;
        expect(this.testRoute.error).to.not.have.been.called;
    });

    it('should process an error correctly', function() {
        this.sinon.stub(this.testRoute, 'prepare', function() { return $.Deferred().reject().promise(); });
        this.sinon.spy(this.testRoute, 'execute');
        this.sinon.spy(this.testRoute, 'error');

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.prepare).to.have.been.calledOnce;
        expect(this.testRoute.execute).to.not.have.been.called;
        expect(this.testRoute.error).to.have.been.calledOnce;
    });
});
