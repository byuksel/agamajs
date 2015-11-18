/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Module which implements utility methods for 2D Euclidean planar
 *       geometry.
 */
if (typeof exports !== 'undefined') {
  exports = module.exports = Geometry;
}

/**
 * Constructs a new Geometry class
 * @constructor
 */
function Geometry() {}

/**
 * Finds intersection points of two circles.
 *
 * @param {number} x1 - X coordinate of the first circle.
 * @param {number} y1 - Y coordinate of the first circle.
 * @param {number} r1 - radius of the first circle.
 * @param {number} x2 - X coordinate of the second circle.
 * @param {number} y2 - Y coordinate of the second circle.
 * @param {number} r2 - radius of the second circle.
 * @return {Array<Object>} - intersection points, defined as an object with 'x', 'y' and 'agamatype'.
 */
Geometry.prototype.getIntersectionCircleCircle = function(x1, y1, r1, x2, y2, r2) {
  // Should throw an error for inadequate number of arguments as otherwise
  // this method will find incorrect results.
  if (arguments.length !== 6) throw new Error('Need total of 6 values as an argument');

  var bigRSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  var r1r2minus = r1 * r1 - r2 * r2;
  var r1r2plus = r1 * r1 + r2 * r2;

  var firstMul = 0.5;
  var secondMul = r1r2minus/(2* bigRSq);
  var thirdMul = 0.5 * Math.sqrt((2*r1r2plus/bigRSq) - (r1r2minus * r1r2minus / (bigRSq * bigRSq)) - 1);

  var inter_x1 = firstMul * (x1 + x2) + secondMul * (x2 - x1) + thirdMul * (y2-y1);
  var inter_y1 = firstMul * (y1 + y2) + secondMul * (y2 - y1) + thirdMul * (x1-x2);

  var inter_x2 = firstMul * (x1 + x2) + secondMul * (x2 - x1) - thirdMul * (y2-y1);
  var inter_y2 = firstMul * (y1 + y2) + secondMul * (y2 - y1) - thirdMul * (x1-x2);

  var returnVal =  [];
  if (!isNaN(inter_x1) && !isNaN(inter_y1)) {
    returnVal.push({ x: inter_x1, y: inter_y1, agamatype: 'pivot'});
  }
  if ((!isNaN(inter_x2) && !isNaN(inter_y2)) &&
      (inter_x1 !== inter_x2 || inter_y1 !== inter_y2)) {
    returnVal.push({ x: inter_x2, y: inter_y2, agamatype: 'pivot'});
  }
  return returnVal;
};

/**
 * Finds intersection points of one circle and one line segment, using
 * [this algorithm]{@link http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm}.
 * The line segment is defined by two points and the line between them.
 *
 * @param {number} linex1 - X coordinate of the first end point on the line segment.
 * @param {number} liney1 - Y coordinate of the first end point on the line segment.
 * @param {number} linex2 - X coordinate of the second end point on the line segment.
 * @param {number} liney2 - Y coordinate of the second end point on the line segment.
 * @param {number} circlex - X coordinate of the circle.
 * @param {number} circley - Y coordinate of the circle.
 * @param {number} circler - radius of the circle.
 * @return {Array<Object>} - intersection points, defined as an object with
 *                           x, y and agamatype.
 */
Geometry.prototype.getIntersectionLineSegmentCircle = function(
  linex1, liney1, linex2, liney2, circlex, circley, circler) {
  // Should throw an error for inadequate number of arguments as otherwise
  // this method will find incorrect results.
  if (arguments.length !== 7) throw new Error('Need total of 7 values as an argument');
  var dx = linex2 - linex1;
  var dy = liney2 - liney1;
  var preResult = [];
  if (this._isFloatEqual(dx, 0) && this._isFloatEqual(dy, 0)) return preResult;

  var dl = dx * dx + dy * dy;
  var t = ((circlex - linex1) * dx + (circley - liney1) * dy) / dl;

  var nearestX = linex1 + t * dx;
  var nearestY = liney1 + t * dy;

  var dist = this.getDist(nearestX, nearestY, circlex, circley);
  if (this._isFloatEqual(dist, circler)) {
    if (this._isFloatLessEqual(t, 1) && this._isFloatGreaterEqual(t, 0)) {
      preResult.push({ x: nearestX, y:nearestY, agamatype: 'pivot'});
    }
    return preResult;
  } else if ( dist > circler ) {
    return preResult;
  }

  // Two points that intersect
  var dt = Math.sqrt(circler * circler - dist * dist) / Math.sqrt(dl);
  var t1 = t - dt;
  if (this._isFloatLessEqual(t1, 1)  && this._isFloatGreaterEqual(t1, 0)) {
    preResult.push({ x: linex1 + t1 * dx, y: liney1 + t1 * dy , agamatype: 'pivot'});
  }
  var t2 = t + dt;
  if (this._isFloatLessEqual(t2, 1)  && this._isFloatGreaterEqual(t2, 0)) {
    preResult.push({ x: linex1 + t2 * dx, y: liney1 + t2 * dy,  agamatype: 'pivot'});
  }

  return preResult;
};

/**
 * Gets distance between two points.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the second point.
 * @param {number} y2 - Y coordinate of the second point.
 * @return {Number} - distance between two points
 */
Geometry.prototype.getDist = function(x1, y1, x2, y2)  {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
};

/**
 * Finds intersection points of two line segments using
 * [this algorithm]{http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect}.
 * A line segment is defined by two points and the line segment in between them.
 *
 * @param {number} ax1 - X coordinate of the first end point on the aline segment.
 * @param {number} ay1 - Y coordinate of the first end point on the line segment.
 * @param {number} ax2 - X coordinate of the second end point on the line segment.
 * @param {number} ay2 - Y coordinate of the second end point on the line segment.
 * @param {number} bx1 - X coordinate of the first end point on the line segment.
 * @param {number} by1 - Y coordinate of the first end point on the line segment.
 * @param {number} bx2 - X coordinate of the second end point on the line segment.
 * @param {number} by2 - Y coordinate of the second end point on the line segment.
*/
Geometry.prototype.getIntersectionLineSegmentLineSegment = function(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  // Should throw an error for inadequate number of arguments as otherwise
  // this method will find incorrect results.
  if (arguments.length !== 8) throw new Error('Need total of 8 values as an argument');
  var m1 = ay2 - ay1;
  var m2 = ax1 - ax2;
  var m3 = (ax2 * ay1) - (ax1 * ay2);
  var m4 = m1*bx1 + m2*by1 + m3;
  var m5 = m1*bx2 + m2*by2 + m3;
  if (m4 * m5 > 0) {
    return [];
  }

  var j1 = by2 - by1;
  var j2 = bx1 - bx2;
  var j3 = (bx2 * by1) - (bx1 * by2);
  var j4 = j1*ax1 + j2*ay1 + j3;
  var j5 = j1*ax2 + j2*ay2 + j3;
  if (j4 * j5 > 0) {
    return [];
  }

  var d = m1 * j2 - j1 * m2;
  if (this._isFloatEqual(d, 0)) {
    if (this._isFloatEqual(ax1 - ax2, 0) && this._isFloatEqual(ay1 - ay2, 0)) {
      return this.getIntersectionPointLineSegment(ax1, ay1, bx1, by1, bx2, by2);
    }
    if (this._isFloatEqual(bx1 - bx2, 0) && this._isFloatEqual(by1 - by2, 0)) {
      return this.getIntersectionPointLineSegment(bx1, by1, ax1, ay1, ax2, ay2);
    }
    return [];
  }

  var num = m2 * j3 - j2 * m3;
  var inter_x = num / d;
  num = j1 * m3 - m1 * j3;
  var inter_y = num / d;
  return [{ x: inter_x, y: inter_y}];
};

/**
 * Finds intersection point of a point and a line segment. Essentially, it will
 * the coordinates of the point if it is on the line segment.
 * A line segment is defined by two points and the line segment in between them.
 *
 * @param {number} px - X coordinate of the point.
 * @param {number} py - Y coordinate of the point.
 * @param {number} x1 - X coordinate of the first end point on the aline segment.
 * @param {number} y1 - Y coordinate of the first end point on the line segment.
 * @param {number} x2 - X coordinate of the second end point on the line segment.
 * @param {number} y2 - Y coordinate of the second end point on the line segment.
 */
Geometry.prototype.getIntersectionPointLineSegment = function(px, py, x1, y1, x2, y2) {
  if (this._isFloatEqual(this.getDist(x1, y1, x2, y2),
                         this.getDist(px,py,x1,y1) + this.getDist(px,py,x2,y2))) {
    return [{x: px, y: py}];
  }
  return [];
};

/**
 * @constant {number} EPSILON - epsilon value mostly used for float calculations
 */
Geometry.prototype.EPSILON =  0.00000001;

/**
 * Returns true if point is in or on the square tile.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @return{boolean} - True is point is in or on the square tile.
 */
Geometry.prototype._isFloatEqual = function(x, y) {
  return Math.abs(x - y) < this.EPSILON;
};

/**
 * Returns true if point is in or on the square tile.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @return{boolean} - True is point is in or on the square tile.
 */
Geometry.prototype._isFloatGreaterEqual = function(x, y) {
  return (Math.abs(x - y) < this.EPSILON || x > y);
};

/**
 * Returns true if point is in or on the square tile.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @return{boolean} - True is point is in or on the square tile.
 */
Geometry.prototype._isFloatLessEqual = function(x, y) {
  return (Math.abs(x - y) < this.EPSILON || x < y);
};
