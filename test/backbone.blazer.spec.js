describe('Backbone.Blazer.Router', function() {

    var TestRoute = Backbone.Blazer.Route.extend({
        execute: function() {}
    });
    
    var RedirectRoute = Backbone.Blazer.Route.extend({
        execute: function() {}
    });

    var TestRouter = Backbone.Blazer.Router.extend();

    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        this.testRoute = new TestRoute();
        this.redirectRoute = new RedirectRoute();

        this.router = new TestRouter();
        this.router.route('route', this.testRoute);
        this.router.route('redirect', this.redirectRoute);
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

        var routerBeforeExecute = this.sinon.spy();
        this.router.on('before:execute', routerBeforeExecute);

        var routerAfterExecute = this.sinon.spy();
        this.router.on('after:execute', routerAfterExecute);

        this.router.navigate('route', { trigger: true });

        expect(this.router.handleRoute).to.have.been.calledOnce;
        expect(this.testRoute.prepare).to.have.been.calledOnce;
        expect(this.testRoute.execute).to.have.been.calledOnce;
        expect(this.testRoute.error).to.not.have.been.called;

        expect(routerBeforeExecute).to.have.been.calledOnce;
        expect(routerAfterExecute).to.have.been.calledOnce;
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

    it('should run a single before and after filter attached to the router', function() {
        this.router.filters = [{
            beforeRoute: this.sinon.spy(),
            afterRoute: this.sinon.spy()
        }];

        this.router.navigate('route', { trigger: true });

        expect(this.router.filters[0].beforeRoute).to.have.been.calledOnce;
        expect(this.router.filters[0].afterRoute).to.have.been.calledOnce;
    });

    it('should run filters attached to a route', function() {
        this.testRoute.filters = [{
            beforeRoute: this.sinon.spy(),
            afterRoute: this.sinon.spy()
        }];

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.filters[0].beforeRoute).to.have.been.calledOnce;
        expect(this.testRoute.filters[0].afterRoute).to.have.been.calledOnce;
    });

    it('should run multiple synchronous filters in order', function() {
        var result = [];

        this.router.filters = [{
            beforeRoute: function() { result.push(1); }
        }, {
            beforeRoute: function() { result.push(2); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(result).to.eql([1, 2]);
    });

    it('should run multiple asynchronous filters in order', function(done) {
        var result = [];

        this.router.filters = [{
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result.push(1); def.resolve(); }, 30);
                return def.promise();
            }
        }, {
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result.push(2); def.resolve(); }, 10);
                return def.promise();
            }
        }];

        this.router.navigate('route', { trigger: true });

        this.testRoute.on('after:execute', function() {
            expect(result).to.eql([1, 2]);
            done();
        });
    });

    it('should run a mix of synchronous and asynchronous filters in order', function(done) {
        var result = [];

        this.router.filters = [{
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result.push(1); def.resolve(); }, 30);
                return def.promise();
            }
        }, {
            beforeRoute: function() {
                result.push(2);
            }
        }, {
            beforeRoute: function() {
                var def = $.Deferred();
                setTimeout(function() { result.push(3); def.resolve(); }, 10);
                return def.promise();
            }
        }];

        this.testRoute.on('after:execute', function() {
            expect(result).to.eql([1, 2, 3]);
            done();
        });

        this.router.navigate('route', { trigger: true });
    });

    it('should run router filters and then route filters', function() {
        var result = [];

        this.router.filters = [{
            beforeRoute: function() { result.push(1); }
        }];

        this.testRoute.filters = [{
            beforeRoute: function() { result.push(2); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(result).to.eql([1, 2]);
    });

    it('should not prepare or execute the route if the filters fail to resolve', function() {
        this.sinon.spy(this.testRoute, 'prepare');
        this.sinon.spy(this.testRoute, 'execute');
        this.sinon.spy(this.testRoute, 'error');

        this.router.filters = [{
            beforeRoute: function() { return $.Deferred().reject().promise(); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.prepare).to.not.have.been.called;
        expect(this.testRoute.execute).to.not.have.been.called;
        expect(this.testRoute.error).to.not.have.been.called;
    });

    it('should redirect to a different route if a filter returns a redirect', function() {
        this.sinon.spy(this.testRoute, 'prepare');
        this.sinon.spy(this.testRoute, 'execute');
        this.sinon.spy(this.testRoute, 'error');

        this.sinon.spy(this.redirectRoute, 'prepare');
        this.sinon.spy(this.redirectRoute, 'execute');
        this.sinon.spy(this.redirectRoute, 'error');

        this.testRoute.filters = [{
            beforeRoute: function() { return this.redirect('redirect'); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.prepare).to.not.have.been.called;
        expect(this.testRoute.execute).to.not.have.been.called;
        expect(this.testRoute.error).to.not.have.been.called;

        expect(this.redirectRoute.prepare).to.have.been.called;
        expect(this.redirectRoute.execute).to.have.been.called;
        expect(this.redirectRoute.error).not.to.have.been.called;
    });

    it('should run before filters in order until a redirect happens', function() {
        var result = [];

        this.testRoute.filters = [{
            beforeRoute: function() { return result.push(1); }
        }, {
            beforeRoute: function() { return this.redirect('redirect'); }
        }, {
            beforeRoute: function() { return result.push(2); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(result).to.eql([1]);
    });

    it('should run after filters in order until a redirect happens', function() {
        var result = [];

        this.testRoute.filters = [{
            afterRoute: function() { return result.push(1); }
        }, {
            afterRoute: function() { return this.redirect('redirect'); }
        }, {
            afterRoute: function() { return result.push(2); }
        }];

        this.router.navigate('route', { trigger: true });

        expect(result).to.eql([1]);
    });

    it('should redirect if a redirect is returned from prepare', function() {
        this.sinon.stub(this.testRoute, 'prepare', function() { return this.redirect('redirect'); });
        this.sinon.spy(this.testRoute, 'execute');
        this.sinon.spy(this.redirectRoute, 'execute');

        this.router.navigate('route', { trigger: true });

        expect(this.testRoute.execute).to.not.have.been.called;
        expect(this.redirectRoute.execute).to.have.been.called;
    });

    it('should redirect if a redirect is returned from execute', function() {
        this.sinon.stub(this.testRoute, 'execute', function() { return this.redirect('redirect'); });
        this.sinon.spy(this.redirectRoute, 'execute');

        this.router.navigate('route', { trigger: true });

        expect(this.redirectRoute.execute).to.have.been.called;
    });

    it('should redirect if a redirect is returned from error', function() {
        this.sinon.stub(this.testRoute, 'prepare', function() { return $.Deferred().reject().promise(); });
        this.sinon.stub(this.testRoute, 'error', function() { return this.redirect('redirect'); });
        this.sinon.spy(this.redirectRoute, 'execute');

        this.router.navigate('route', { trigger: true });

        expect(this.redirectRoute.execute).to.have.been.called;
    });

});
