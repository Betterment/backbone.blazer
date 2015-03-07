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

    it('should run a single before and after filter', function() {
        this.router.filters = [{
            beforeRoute: sinon.spy(),
            afterRoute: sinon.spy()
        }];

        this.router.navigate('route', { trigger: true });

        expect(this.router.filters[0].beforeRoute).to.have.been.calledOnce;
        expect(this.router.filters[0].afterRoute).to.have.been.calledOnce;
    });

    it('should run multiple synchronous filters in order', function() {
        var result = null;

        this.router.filters = [{
            beforeRoute: function() { result = 'first'; }
        }, {
            beforeRoute: function() { result = 'second'; }
        }];

        this.router.navigate('route', { trigger: true });

        expect(result).to.equal('second');
    });

    it('should run multiple asynchronous filters in order', function(done) {
        var result = null;

        this.router.filters = [{
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result = 'first'; def.resolve(); }, 30);
                return def.promise();
            }
        }, {
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result = 'second'; def.resolve(); }, 10);
                return def.promise();
            }
        }];

        this.router.navigate('route', { trigger: true });

        this.testRoute.on('after:execute', function() {
            expect(result).to.equal('second');
            done();
        });
    });

    it('should run a mix of synchronous and asynchronous filters in order', function(done) {
        var result = null;

        this.router.filters = [{
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result = 'first'; def.resolve(); }, 30);
                return def.promise();
            }
        }, {
            beforeRoute: function() {
                result = 'second';
            }
        }, {
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result = 'third'; def.resolve(); }, 10);
                return def.promise();
            }
        }];

        this.router.navigate('route', { trigger: true });

        this.testRoute.on('after:execute', function() {
            expect(result).to.equal('third');
            done();
        });
    });
});
