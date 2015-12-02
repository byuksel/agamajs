/**
 * @copyright Copyright (c) 2015, ProjectAgama, All Rights Reserved.
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Agama Geometry Unit Test
 */

/*jshint expr: true*/
var Geometry = require('../../lib/geometry');

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

var expect = chai.expect;

chai.use(sinonChai);
chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

var myG = new Geometry();

describe('Geometry.js Unit Test', function() {

  it('(getDist) should return correct values for points', function() {
    expect(myG.getDist(0, 0, 0, 0)).eql(0);
    expect(myG.getDist(0, 1, 1, 1)).eql(1);
    expect(myG.getDist(3.45677, -1.23, 7.8888, 9)).closeTo(11.14880217426518,
                                                           0.000000000000001);
    expect(myG.getDist(0, NaN, 0, 0)).eql(NaN);
  });

  it('(getIntersectionLineSegmentLineSegment) should work for end point ' +
     ' intersections', function() {
    expect(myG.getIntersectionLineSegmentLineSegment(
      0, 0, 10, 0, 10, 0, 10, 2)).deep.contains(
        {x: 10, y: 0}, 'can intersect at 90 degrees at end points');
    expect(myG.getIntersectionLineSegmentLineSegment(
      0, 0, 0, 10, 0, 10, 2, 10)).deep.contains(
        {x: -0, y: 10}, 'can intersect at 90 degrees at end points');
    expect(myG.getIntersectionLineSegmentLineSegment(
      10, 0, 10, 0, 0, 0, 10, 0)).eql(
        [{x: 10, y: 0}], 'can interset at the exact end point');
    expect(myG.getIntersectionLineSegmentLineSegment(
      0, 0, 10, 0, 10, 0, 10, 0)).eql(
        [{x: 10, y: 0}], 'can interset at the exact end point');
    expect(myG.getIntersectionLineSegmentLineSegment(
      0, 0, 10, 0, 10, -2, 10, 2)).eql(
        [{x: 10, y: 0}], 'can intersect at 90 degrees at end point');
    expect(myG.getIntersectionLineSegmentLineSegment(
      0, 0, 10.2345, 0, 10.2345, -2, 10.2345, 2)).eql(
        [{x: 10.2345, y: 0}],
        'can intersect at single point with decimal points');
  });

  it('(getIntersectionLineSegmentLineSegment) should work non-intersections',
     function() {
       expect(myG.getIntersectionLineSegmentLineSegment(
         0, 0, 5, 5, -1, -1, -5, -5)).eql([],
                                          'collinear, does not intersect');
       expect(myG.getIntersectionLineSegmentLineSegment(
         30, 30, 40, 30, 0, 0, 10, 0)).eql([],
                                           'parallel, does not intersect');
       expect(myG.getIntersectionLineSegmentLineSegment(
         0, 0, 10, 0, 11, 0, 10, 2)).eql([],
                                         'does not intersect');
       expect(function() {
         myG.getIntersectionLineSegmentLineSegment(0, 0, 10, 0, 11, 0, 10);}
             ).to.throw('Need total of 8 values as an argument');
     });

  it('(getIntersectionLineSegmentCircle) should work intersections',
     function() {
       var a = myG.getIntersectionLineSegmentCircle(0, 0, 5, 5, -5, -5, 8);
       expect(a[0].x).closeTo(0.65685424949238, 0.00000000000001);
       expect(a[0].y).closeTo(0.65685424949238, 0.00000000000001);
       a = myG.getIntersectionLineSegmentCircle(0, 0, 5, 5, 10, 10, 8);
       expect(a[0].x).closeTo(4.34314575050762, 0.00000000000001);
       expect(a[0].y).closeTo(4.34314575050762, 0.00000000000001);
       a = myG.getIntersectionLineSegmentCircle(0, 0, 0, 10, 5, 5, 5);
       expect(a[0].x).equal(0);
       expect(a[0].y).equal(5);
       a = myG.getIntersectionLineSegmentCircle(0, 5, 0, 10, 5, 5, 5);
       expect(a[0].x).equal(0);
       expect(a[0].y).equal(5);
       a = myG.getIntersectionLineSegmentCircle(
         205.45517328095667, 105, 534.5448267190434, 105, 370, 200, 190);
       expect(a).eql([{x: 205.45517328095664,y: 105,agamatype: 'pivot'},
                      {x: 534.5448267190434,y: 105,agamatype: 'pivot'}]);
     });

  it('(getIntersectionLineSegmentCircle) should work non-intersections',
     function() {
       expect(myG.getIntersectionLineSegmentCircle(
         0, 0, 5, 5, -5, -5, 3)).eql([], 'collinear, does not intersect');
       expect(myG.getIntersectionLineSegmentCircle(
         30, 30, 40, 30, 0, 0, 10)).eql([], 'parallel, does not intersect');
       expect(myG.getIntersectionLineSegmentCircle(
         0, 0, 10, 0, 11, -3, 1)).eql([], 'does not intersect');
       expect(function() {
         myG.getIntersectionLineSegmentCircle(0, 10, 0, 11, 0, 10);}).to.throw(
           'Need total of 7 values as an argument');
     });

  it('(getIntersectionCircleCircle) should work intersections', function() {
    var a = myG.getIntersectionCircleCircle(0, 0, 5, -5, -5, 8);
    expect(a[0].x).closeTo(-4.042491947020064, 0.00000000000001);
    expect(a[0].y).closeTo(2.9424919470200646, 0.00000000000001);
    a = myG.getIntersectionCircleCircle(0, 0, 5, 0, 10, 8);
    expect(a[0].x).closeTo(3.962007067131506, 0.00000000000001);
    expect(a[0].y).closeTo(3.05, 0.00000000000001);
    a = myG.getIntersectionCircleCircle(0, 0, 10, 5, 5, 5);
    expect(a[0].x).closeTo(9.557189138830738, 0.00000000000001);
    expect(a[0].y).closeTo(2.942810861169262, 0.00000000000001);
    a = myG.getIntersectionCircleCircle(0, 5, 0, 5, 5, 5);
    expect(a[0].x).equal(0);
    expect(a[0].y).equal(5);
  });

  it('(getIntersectionLineSegmentCircle)' +
     ' should work non-intersections', function() {
       expect(myG.getIntersectionCircleCircle(
         0, 0, 5, -5, -5, 1)).eql([], 'collinear, does not intersect');
       expect(myG.getIntersectionCircleCircle(
         30, 30, 30, 0, 0, 1)).eql([], 'parallel, does not intersect');
       expect(myG.getIntersectionCircleCircle(
         0, 0, 10, 11, -3, 1)).eql([], 'does not intersect');
       expect(function() {
         myG.getIntersectionCircleCircle(10, 0, 11, 0, 10);}).to.throw(
           'Need total of 6 values as an argument');
     });
});
