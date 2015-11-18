/**
 * @copyright Copyright (c) 2015, ProjectAgama, All Rights Reserved.
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Agama SquareTile Unit Test
 */

/*jshint expr: true*/
var SquareTile = require('../../lib/squaretile');

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);
chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('SquareTile.js Unit Test', function() {

  it('SquareTile should have correct values', function(){
    var testClass = new SquareTile(0, 0, 10, 20);
    expect(testClass.topX).eql(0);
    expect(testClass.topY).eql(0);
    expect(testClass.bottomX).eql(10);
    expect(testClass.bottomY).eql(20);
    expect(testClass.x_center).eql(5);
    expect(testClass.y_center).eql(10);
  });

  it('SquareTile should throw errors if top values are bigger than bottom values', function(){
    expect(function() {new SquareTile(0, 10, 0, 0);}).to.throw('topY:10 is bigger than bottomY:0');
    expect(function() {new SquareTile(10, 0, 0, 0);}).to.throw('topX:10 is bigger than bottomX:0');
  });

  it('SquareTile.isInside() should work', function(){
    var testClass = new SquareTile(0, 0, 10, 20);
    expect(testClass.isInside(0,0)).eql(true);
    expect(testClass.isInside(5,0)).eql(true);
    expect(testClass.isInside(5,5)).eql(true);
    if (Number.EPSILON > 0) {
      // Number.EPSILON is not defined on phantomJS
      expect(testClass.isInside(10 + Number.EPSILON, 20 - Number.EPSILON)).eql(
        true, 'Number.EPSILON test');
    }
    expect(testClass.isInside(15,15)).eql(false);
    expect(testClass.isInside(10.0001, 20)).eql(false);
  });

  it('SquareTile.isInside() should work', function(){
    var testClass = new SquareTile(0, 0, 10, 20);
    var a = [];
    testClass.pushIfInsideTile(0, 0, a);
    testClass.pushIfInsideTile(5, 5, a);
    testClass.pushIfInsideTile(15, 15, a);
    testClass.pushIfInsideTile(10.01, 0, a);
    expect(a).to.deep.contain.members([{x: 0, y:0}, {x: 5, y:5}]);
    expect(a).not.to.contain({x: 15, y:15});
    expect(a).not.to.contain({x: 10.01, y:0});
  });


});
