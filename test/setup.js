var jsdom = require('jsdom').jsdom;
global.document = jsdom('');
global.window = global.document.defaultView;
global.navigator = global.window.navigator = {
  userAgent: 'NodeJS JSDom',
  appVersion: ''
};
global._ = require('underscore');
global.$ = require('jquery');
global.Backbone = require('backbone');
global.Promise = require('bluebird');
Backbone.$ = global.$;
global.Blazer = require('../backbone.blazer');

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

global.chai = require('chai');
global.expect = chai.expect;
global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
chai.use(sinonChai);

