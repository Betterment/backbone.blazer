var chai = require('chai'),
    expect = chai.expect;

global.$ = require('jquery');
global._ = require('underscore');
global.Backbone = require('backbone');
global.Backbone.$ = global.$;

var Trailblazer = require('./trailblazer');

describe('Backbone.Trailblazer.Router', function() {
    it('should work', function() {
        expect(1).to.equal(2);
    });
});
