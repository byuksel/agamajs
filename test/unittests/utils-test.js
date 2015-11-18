/**
 * @copyright Copyright (c) 2015, ProjectAgama, All Rights Reserved.
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Agama Utils Unit Test
 */

/*jshint expr: true*/
var Utils = require('../../lib/utils');

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);
chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('Utils.js Unit Test', function() {

  it('EPSILON and PRECISION should be correct', function(){
    expect(Utils.EPSILON).equal(0.00000001);
    expect(Utils.PRECISION).equal(1);
  });

  it('(isFloatEqual) should work', function(){
    expect(Utils.isFloatEqual(0, 0)).equal(true);
    expect(Utils.isFloatEqual(0, 10)).equal(false);
    expect(Utils.isFloatEqual(0 + Utils.EPSILON, 0)).equal(false);
    expect(Utils.isFloatEqual(0 + Utils.EPSILON/2, 0)).equal(true);
  });

  it('(sortByXY) should work with regual numbers', function(){
    expect(Utils.sortByXY(0, 0, 0, 0)).equal(0);
    expect(Utils.sortByXY(1, 0, 0, 0)).equal(1);
    expect(Utils.sortByXY(0, 1, 0, 0)).equal(1);
    expect(Utils.sortByXY(0, 0, 1, 0)).equal(-1);
    expect(Utils.sortByXY(0, 0, 0, 1)).equal(-1);
  });

  it('(sortByXY) should work with close floating numbers', function(){
    expect(Utils.sortByXY(0 + Utils.EPSILON/2, 0, 0, 0 - Utils.EPSILON/2)).equal(0);
    expect(Utils.sortByXY(0 + Utils.EPSILON, 0, 0, 0)).equal(1);
    expect(Utils.sortByXY(0, Utils.EPSILON, 0, 0)).equal(1);
    expect(Utils.sortByXY(0, 0, Utils.EPSILON, 0)).equal(-1);
  });

  it('(isPrecisionEqual) should work', function(){
    expect(Utils.isPrecisionEqual(3.34, 3.3394342432)).equal(true);
    expect(Utils.isPrecisionEqual(3.34, 3.394342432)).equal(false);
    expect(Utils.isPrecisionEqual(3.40, 3.394342432)).equal(true);
    expect(Utils.isPrecisionEqual(3.45, 3.4)).equal(false);
    expect(Utils.isPrecisionEqual(3.55, 3.5)).equal(true);
    expect(Utils.isPrecisionEqual(-3.45, -3.4)).equal(false);
    expect(Utils.isPrecisionEqual(-3.55, -3.5)).equal(true);
  });

  it('(pushIfUnique) should work', function(){
    var a = [0];
    expect(Utils.pushIfUnique(a, 0)).equal(false);
    expect(a.length).equal(1);
    expect(Utils.pushIfUnique(a, 0 + Utils.EPSILON)).equal(true);
    expect(a.length).equal(2);
    expect(a).to.contain(0 + Utils.EPSILON);
  });

  it('(svgLineStr) should work', function(){
    expect(Utils.svgLineStr(0, 0, 1, 1)).equal('M0,0L1,1');
    expect(Utils.svgLineStr(0, 0, 0.1, -0.1)).equal('M0,0L0.1,-0.1');
  });


});
