var _ = require('underscore'),
    $ = require('jquery'),
    Backbone = require('backbone');

Backbone.$ = $;

var Marionette = require('backbone.marionette'),
    chai = require('chai'),
    expect = chai.expect,
    Trailblazer = require('./trailblazer');

describe('Backbone.Trailblazer.Router', function() {
    it('should work', function() {
        expect(true).to.equal(true);
    });
});
