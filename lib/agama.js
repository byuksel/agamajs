/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Agama module. Provides all the functionality for constructing
 *       tessellations like a craftsman would do it.
 */
//if (typeof exports !== 'undefined') {

exports = module.exports = Agama;

var Animation = require('./animation.js'),
    Geometry = require('./geometry.js'),
    Utils = require('./utils.js'),
    Raphael = require('../../raphael/raphael.amd.js'),
    SquareTile = require('./squaretile.js');
//}

/**
 * Constructs a new Agama class
 * @constructor
 */
function Agama() {
  this._constructionelements = [];
  this._patternlines = [];
  this._points = [];
  var t = Raphael.apply(this, arguments);
  for (var property in t) {
    if (t.hasOwnProperty(property)) {
      this[property] = t[property];
    }
  }
}

Agama.prototype = Raphael.prototype;
Agama.prototype.constructor = Agama;
Agama.prototype.agGeo = new Geometry();
Agama.st = {};//Set.prototype;
Agama.el = Raphael.el;

/**
 * Get the path which is on the canvas. This is the output of original
 * path after transformations are applied.
 *
 * @return {Array<Array<String|Number>>} - Array of path arrays made up of
 *                                         string and numbers
 */
Agama.el.getActualPath = function() {
  return this.paper.raphael.mapPath(this.getPath(), this.matrix);
};

/**
 * Get the path string for actual path. @see {@link Agama#getActualPath}
 *
 * @return {String} - string that describes the path.
 */
Agama.el.getActualPathString = function() {
  var outputStr = '';
  var path = this.getActualPath();
  for (var i = 0; i < path.length; i++) {
    if (path[i].length === 0) continue;
    outputStr += path[i][0];
    if (path[i].length === 1) continue;
    outputStr += path[i].slice(1, path[i].length).join(',');
  }
  return outputStr;
};

/**
 * Set the opacity attribute of the elemement to the value of parent
 * paper's elementOpacity.
 */
Agama.el.setOpacity = function() {
  if (typeof(this.paper.elementOpacity) !== 'undefined') {
    this.attr('opacity', this.paper.elementOpacity);
  }
};

/**
 * Set the opacity attributes of all elements in the set.
 * @see {@link Agama#setOpacity}
 */
Agama.st.setOpacity = function () {
  this.forEach(function (el) {
    el.setOpacity();
  });
};

/**
 * Returns 1 if (x,y) of a is greater than (x, y) of b, -1 if opposite,
 * 0 if they are float-equal. This first extracts (x,y) of a and b and
 * then calls Utils.sortByXY.
 * @see {@link Utils#sortByXY}
 * @param {Object} a - is an object of the agamatype pivot or point.
 * @param {Object} b - is an object of the agamatype of pivot or point.
 * @return {Number} - 1 if a is greater than b, 0 if equal, -1 otherwise.
 */
Agama.sortByXY = function(a, b) {
  var zoo = Agama.extractCoordinates(a, b);
  return Utils.sortByXY(zoo.x1, zoo.y1, zoo.x2, zoo.y2);
};

/**
 * Returns the actual parameters for an object of type agamaline or agamacircle.
 * For circle, the returned object would have cx, cy and r.
 * For line, the returned object would have x1, y1, x2, y2.
 * @param {Object} a - is an object of the type agamacircle or agamaline.
 * @return {Object} - if a is agamacircle, this object has cx, cy and r.
 *                    if a is agamaline, this object has x1, y1, x2, y2.
 */
Agama.el.getActualParameters = function() {
  if (this.agamatype === 'circle') {
    return { cx: this.actualAttr('cx'),
             cy: this.actualAttr('cy'),
             r: this.actualAttr('r') };
  }
  if (this.agamatype === 'line') {
    return { x1: this.actualAttr('x1'),
             y1: this.actualAttr('y1'),
             x2: this.actualAttr('x2'),
             y2: this.actualAttr('y2') };
  }
  return {};
};


/**
 * Returns intersection points between this and b. The elements must
 * each be of the type either a 'circle' or a 'line'.
 * @param {Object} a - is an object of the agamatype of circle or line.
 * @return {Array<Object>} - Array of agamapivots.
 */
Agama.el.getIntersection = function(b) {
  var isValidCall = (b instanceof Agama.el.constructor) &&
        (this.agamatype === 'circle' || this.agamatype === 'line') &&
        (b.agamatype === 'circle' || b.agamatype === 'line');
  if (!isValidCall) {
    return [];
  }

  var pathInter;
  if (this.agamatype === 'circle' && b.agamatype === 'circle') {
    var first = this.getActualParameters();
    var second = b.getActualParameters();
    pathInter = this.paper.agGeo.getIntersectionCircleCircle(
      first.cx, first.cy, first.r,
      second.cx, second.cy, second.r);
  } else if ((this.agamatype === 'circle' && b.agamatype === 'line') ||
             (this.agamatype === 'line' && b.agamatype === 'circle')) {
    var circleParams, lineParams;
    if (this.agamatype === 'circle') {
      circleParams = this.getActualParameters();
      lineParams = b.getActualParameters();
    } else {
      lineParams = this.getActualParameters();
      circleParams = b.getActualParameters();
    }
    pathInter = this.paper.agGeo.getIntersectionLineSegmentCircle(
      lineParams.x1, lineParams.y1, lineParams.x2, lineParams.y2,
      circleParams.cx, circleParams.cy, circleParams.r);
  } else {
    var firstLine = this.getActualParameters();
    var secondLine = b.getActualParameters();
    pathInter = this.paper.agGeo.getIntersectionLineSegmentLineSegment(
      firstLine.x1, firstLine.y1, firstLine.x2, firstLine.y2,
      secondLine.x1, secondLine.y1, secondLine.x2, secondLine.y2);
  }

  var preResult = [];
  for (var interIndex = 0; interIndex < pathInter.length; interIndex++) {
    var inter = pathInter[interIndex];
    var alreadyExists = false;
    for (var i = 0; i < preResult.length; i++) {
      if (Utils.isPrecisionEqual(preResult[i].x, inter.x) &&
          Utils.isPrecisionEqual(preResult[i].y, inter.y)) {
        alreadyExists = true;
        break;
      }
    }
    if (!alreadyExists) {
      preResult.push({ x: inter.x,
                       y: inter.y,
                       agamatype: 'pivot'});
    }
  }
  preResult.sort(Agama.sortByXY);
  return preResult;
};

/**
 * Returns the array of construction elements. The array is the reference to
 * actual array. Any operation on this array will be reflected future calls
 * to construction elements array.
 *
 * @return {Array<Object>} - Array of construction elements,i.e. lines or circles.
 */
Agama.prototype.getConstructionElements = function() {
  return this._constructionelements;
};

/**
 * Adds the element to the array of construction elements.
 *
 * @param {Object} a - Element object to add to the array.
 * @throws {Error} - If the object is not agamatype circle or line.
 *                   @see {@link Agama#point}
 *                   @see {@link Agama#concircle}
 */
Agama.prototype.addToConstructionElements = function(a) {
  if (a.agamatype !== 'line' && a.agamatype !=='circle') {
    throw Error('This object is not agamatype circle or line.');
  }
  this._constructionelements.push(a);
};

/**
 * Returns the array of points. The array is the reference to
 * actual array. Any operation on this array will be reflected future calls
 * to points array.
 *
 * @return {Array<Object>} - Array of points.
 */
Agama.prototype.getPoints = function() {
  return this._points;
};

/**
 * Adds the element to the array of construction elements.
 *
 * @param {Object} a - Point bbject to add to the array.
 * @throws {Error} - If the object is not a point.
 *                   @see {@link Agama#point}
 */
Agama.prototype.addToPoints = function(a) {
  if (a.agamatype !== 'point') {
    throw Error('This object is not agamatype point');
  }
  this._points.push(a);
};

/**
 * Returns the array of patternlines. The array is the reference to
 * actual array. Any operation on this array will be reflected future calls
 * to patternlines array.
 *
 * @return {Array<Object>} - Array of patternlines.
 */
Agama.prototype.getPatternLines = function() {
  return this._patternlines;
};

/**
 * Adds the patternline element to the array of pattern lines.
 *
 * @param {Object} a - PatternLine object to add to the array.
 * @throws {Error} - If the object is not a patternline.
 *                   @see {@link Agama#patternline}
 */
Agama.prototype.addToPatternLines = function(a) {
  if (a.agamatype !== 'patternline') {
    throw Error('This object is not agamatype patternline');
  }
  this._patternlines.push(a);
};

/**
 * Adds the point element to the element's array of intersection points.
 *
 * @param {Object} a - Point object to add to the array.
 * @throws {Error} - If the object is not a point
 *                   @see {@link Agama#point}
 */
Agama.el.addToIntersectionPoints = function(a) {
  if (a.agamatype !== 'point') {
    throw Error('This object is not agamatype point');
  }
  if (!this._intersectionpoints) {
    this._intersectionpoints = [];
  }
  if (Utils.pushIfUnique(this._intersectionpoints, a)) {
    this._intersectionpoints.sort(Agama.sortByXY);
  }
};

/**
 * Returns an intersection point from the element's intersection points array.
 *
 * @return {Object} - Point object.
 */
Agama.el.getIntersectPoint = function(a) {
  return this._intersectionpoints[a];
};

Agama.el.agamatype = Agama.el.type;

/**
 * Extract coordinates. The inputs can be 3 different things:
 * - 1) Four numbers which represent x1, y1, x2, and y2.
 *      In this case, this function just returns them.
 * - 2) Two agamatype pivot objects. In this case, x1 and y1 are
 *      a.x, and a.y and x2 and y2 are b.x and b.y.
 * - 3) Two agamatype point objects. In this case, x1 and y1 are
 *      a.attrs.cx and a.attrs.cy and x2 and y2 are b.attrs.cx
 *      and b.attrs.cy.
 *
 * @return {Object} - An object with x1, y1, x2 and y2 properties.
 */
Agama.extractCoordinates = function(a, b, c, d) {
  var x1, y1, x2, y2;
  if (a.agamatype === 'pivot' && b.agamatype === 'pivot') {
    x1 = a.x;
    y1 = a.y;
    x2 = b.x;
    y2 = b.y;
  } else if (a.agamatype === 'point' && b.agamatype === 'point') {
    x1 = a.actualAttr('cx');
    y1 = a.actualAttr('cy');
    x2 = b.actualAttr('cx');
    y2 = b.actualAttr('cy');
  } else {
    x1 = a;
    y1 = b;
    x2 = c;
    y2 = d;
  }
  return {x1: x1, y1: y1, x2: x2, y2: y2};
};


/**
 * Get the actual attributes for the element that is on the canvas.
 * In the original Raphael code, when a transformation is applied on
 * a shape such as circle, the original attributes won't change. For
 * example, you can scale a circle of radius 50 up 2x and the scaled
 * circle would still return radius as 50 (it should be 100).
 * This method solves this problem. Actual attributes are found by
 * applying all the transformations the element went through.
 * This method only works for circle and line.
 *
*/
Agama.el.actualAttr = function(a) {
  if (this.type === 'circle') {
    if (a === 'cx') {
      return this.matrix.x(this.attr('cx'), this.attr('cy'));
    }
    if (a === 'cy') {
      return this.matrix.y(this.attr('cx'), this.attr('cy'));
    }
    if (a === 'r') {
      var r = this.attr('r');
      var newRX = this.matrix.x(0, r);
      var newRY = this.matrix.y(0, r);
      return Math.sqrt(newRX*newRX + newRY*newRY);
    }
  }
  if (this.type === 'path' &&
      typeof(this.attr('x1')) !== 'undefined' &&
      typeof(this.attr('y1')) !== 'undefined' &&
      typeof(this.attr('x2')) !== 'undefined' &&
      typeof(this.attr('y2')) !== 'undefined') {
    if (a === 'x1') {
      return this.matrix.x(this.attr('x1'), this.attr('y1'));
    }
    if (a === 'y1') {
      return this.matrix.y(this.attr('x1'), this.attr('y1'));
    }
    if (a === 'x2') {
      return this.matrix.x(this.attr('x2'), this.attr('y2'));
    }
    if (a === 'y2') {
      return this.matrix.y(this.attr('x2'), this.attr('y2'));
    }
  }
  return this.attr(a);
};

Agama.getWidthHeight = function(document, elemID) {
  var domElem = document.getElementById(elemID);
  var width = Math.abs(domElem.offsetWidth);
  var height = Math.abs(domElem.offsetHeight);
  return { width: width, height: height };
};

// Given width and height of Canvas, and a padding value,
// this finds the coordinates of a nice square area in the middle
// to draw.
Agama.getSquareCoorInMiddle = function(winInfo, padding) {
  var length = winInfo.height;
  if (winInfo.height > winInfo.width) length = winInfo.width;
  var radius = length/2 - padding;
  var x_center = winInfo.width/2;
  var y_center = winInfo.height/2;
  return { topX: x_center - radius,
           topY: y_center - radius,
           bottomX: x_center + radius,
           bottomY: y_center + radius };
};


Agama.prototype.getSquareTile = function(topX, topY, bottomX, bottomY) {
  return new SquareTile(topX, topY, bottomX, bottomY);
};

/**
 * Creates a returns a construction line (conline) element. When created,
 * this element is added to the construction elements array of the paper.
 * This element keeps track of its intersection points with other construction
 * elements on the paper. All the intersection points of this element
 * is sorted by {@link Agama.sortByXY} and they are accessible through
 * {@link Agama.el.getIntersectPoint}.
 *
 * Agamatype of this object is 'line'.
 *
 * The line has two ends (x1, y1) and (x2, y2).
 *
 * @param {Number} a - x1 coordinate of first endpoint of the line.
 * @param {Number} b - y1 coordinate of first endpoint of the line.
 * @param {Number} c - x2 coordinate of second endpoint of the line.
 * @param {Number} d - y2 coordinate of second endpoint of the line.
 * @return {Object} - A construction line object.
 */
Agama.prototype.conline = function(a, b, c, d) {
  var zoo = Agama.extractCoordinates(a, b, c, d);
  var k = this.path.call(this, Utils.svgLineStr(zoo.x1, zoo.y1, zoo.x2, zoo.y2));
  k.attrs.x1 = zoo.x1;
  k.attrs.y1 = zoo.y1;
  k.attrs.x2 = zoo.x2;
  k.attrs.y2 = zoo.y2;
  k.agamatype = 'line';
  k.setOpacity();
  k._findAllIntersections();
  this.addToConstructionElements(k);
  return k;
};

/**
 * Creates a returns a pattern line (patternline) element. Unlike conline and
 * concircle, when created, this element is NOT added to the construction elements
 * array of the paper. Instead it is added to the patternline array of the paper.
 * This element does NOT keep track of its intersection points with other construction
 * elements on the paper.
 *
 * Pattern line forms the lines of the final pattern.
 *
 * Agamatype of this object is 'patternline'.
 *
 * @param {Number} a - x1 coordinate of the first endpoint of the line.
 * @param {Number} b - y1 coordinate of the first endpoint of the line.
 * @param {Number} c - x2 coordinate of the first endpoint of the line.
 * @param {Number} d - y2 coordinate of the first endpoint of the line.
 * @return {Object} - A patternline object.
 */
Agama.prototype.patternline = function (a, b, c, d) {
  var zoo = Agama.extractCoordinates(a, b, c, d);
  var m = Utils.svgLineStr(zoo.x1, zoo.y1, zoo.x2, zoo.y2);
  var k = this.path.call(this, m);
  k.attrs.x1 = zoo.x1;
  k.attrs.y1 = zoo.y1;
  k.attrs.x2 = zoo.x2;
  k.attrs.y2 = zoo.y2;
  k.agamatype = 'patternline';
  k.attr('stroke', 'red');
  k.attr('stroke-width', 5);
  k.setOpacity();
  this.addToPatternLines(k);
  return k;
};

/**
 * Creates a returns an extended construction line (extendedconline) element.
 * Just like conline and concircle, when created, this element is added to the
 * construction elements array of the paper.
 * This element keeps track of its intersection points with other construction
 * elements on the paper. All the intersection points of this element
 * is sorted by {@link Agama.sortByXY} and they are accessible through
 * {@link Agama.el.getIntersectPoint}.
 *
 * Agamatype of this object is 'line'.
 *
 * The extended line extends beyond its end points (x1, y1) and (x2, y2).
 * It goes through these points, but the end points lay on the square tile
 * that the line is drawn within. Agama will extend the line beyond (x1, y1)
 * and (x2, y2) and would find which end points the line has on the square
 * tile. Agama then uses these points on the square line to create the line.
 * If (x1, y1) or (x2, y2) lay on the square line, then Agama uses them.
 *
 * @param {Number} a - x1 coordinate of the line
 * @param {Number} b - y1 coordinate of the line
 * @param {Number} c - x2 coordinate of the line
 * @param {Number} d - y2 coordinate of the line
 * @return {Object} - An extended construction line (extendedconline) object.
 */
Agama.prototype.extendedconline = function (sqTile, a, b, c, d) {
  var zoo = Agama.extractCoordinates(a, b, c, d);
  var x1 = zoo.x1;
  var y1 = zoo.y1;
  var x2 = zoo.x2;
  var y2 = zoo.y2;

  var yDif = y1 - y2;
  var xDif = x1 - x2;

  // Handled special conditions
  var line;
  if (xDif === 0 && sqTile.isInside(x1, sqTile.topY)) {
    line = this.conline(x1, sqTile.topY, x1, sqTile.bottomY);
  } else {
    if (yDif === 0 && sqTile.isInside(sqTile.topX, y1)) {
      line = this.conline(sqTile.topX, y1, sqTile.bottomX, y1);
    } else {
      var slope = yDif / xDif;
      var intercept = y1 - slope * x1;

      var derivedTopY = slope * sqTile.topX + intercept;
      var derivedTopX = (sqTile.topY - intercept) / slope;
      var derivedBottomY = slope * sqTile.bottomX + intercept;
      var derivedBottomX = (sqTile.bottomY - intercept) / slope;

      var finalXY = [];
      sqTile.pushIfInsideTile(sqTile.topX, derivedTopY, finalXY);
      sqTile.pushIfInsideTile(derivedTopX, sqTile.topY, finalXY);
      sqTile.pushIfInsideTile(sqTile.bottomX, derivedBottomY, finalXY);
      sqTile.pushIfInsideTile(derivedBottomX, sqTile.bottomY, finalXY);

      if (finalXY.length > 1) {
        line = this.conline(finalXY[0].x, finalXY[0].y, finalXY[1].x, finalXY[1].y);
      }
    }
  }
  return line;
};

/**
 * Creates a returns a construction circle (concircle) element.
 * When created, this element is added to the construction elemetns
 * array of the paper. This element keeps track of its intersection
 * points with other construction elements on the paper.
 * All the intersection points of this element is sorted by
 * {@link Agama.sortByXY}.
 *
 * Agamatype of this object is 'point'.
 *
 * A concircle behaves exactly how you would expect a Raphael.circle
 * to behave. The differences are such that, a concircle keeps track of
 * intersections with other construction elements. and its parent paper
 * keeps track of this element in its construction elements array.
 *
 * @param {Number} a - x coordinate of the circle.
 * @param {Number} c - y coordinate of the circle.
 * @param {Number} d - radius of the circle.
 * @return {Object} - A construction circle object.
 */
Agama.prototype.concircle = function(a, c, d) {
  var k = this.circle.call(this, a, c, d);
  k.agamatype = k.type;
  k._findAllIntersections();
  k.setOpacity();
  this.addToConstructionElements(k);
  return k;
};


/**
 * Creates a returns a point element. A point is a Raphael circle with radius
 * omitted. Points are used to keep track of intersections by the paper.
 * Points are NOT construction elements so they dont intersect with other
 * construction elements.
 *
 * Agamatype of this object is *point*.
 *
 * @param {Number} a - x coordinate of the point.
 * @param {Number} c - y coordinate of the point.
 * @return {Object} - A point object.
 */
Agama.prototype.point = function(a, c) {
  var k = this.circle.call(this, a, c, 10);
  k.touchingElements = [];
  k.agamatype = 'point';
  k.setOpacity();
  this.addToPoints(k);
  return k;
};

/**
 * Finds all the intersections of this with all the construction elements
 * on the paper. If there is no intersection point at that location, it
 * creates an intersection point, adds the point to this' intersection points
 * and the intersecting element's intersection points. To the new intersection
 * point's touching elements, it also adds this and the intersecting element.
 *
 * If an intersection point already exists where this and the intersecting
 * element intersect, then findAllIntersections will add this to the touching
 * elements of the point. findAllIntersections will also add the intersection
 * point to the intersection points array of *this*.
 */
Agama.el._findAllIntersections = function() {
  var me = this;
  for (var elIndex = 0; elIndex < this.paper.getConstructionElements().length; elIndex++) {
    var el = this.paper.getConstructionElements()[elIndex];
    if (el.id === me.id) return;
    var all = me.getIntersection(el);
    for (var interXYIndex = 0; interXYIndex < all.length; interXYIndex++) {
      var interXY = all[interXYIndex];
      var existingPoint = false;
      var i;
      var allPoints = me.paper.getPoints();
      for (i = 0; i < allPoints.length; i++) {
        if (Utils.isPrecisionEqual(allPoints[i].attrs.cx, interXY.x) &&
            Utils.isPrecisionEqual(allPoints[i].attrs.cy, interXY.y)) {
           existingPoint = true;
          break;
        }
      }
      if (existingPoint) {
        me.addToIntersectionPoints(allPoints[i]);
        Utils.pushIfUnique(allPoints[i].touchingElements, me);
      } else {
        var k = me.paper.point(interXY.x, interXY.y);
        k.touchingElements.push(me);
        k.touchingElements.push(el);
        me.addToIntersectionPoints(k);
        el.addToIntersectionPoints(k);
      }
    }
  }
};

Agama.prototype.getFullPathOfPattern = function() {
  var allPaths = '';
  for (var elemIndex = 0; elemIndex < this.getPatternLines().length; elemIndex++) {
    var elem = this.getPatternLines()[elemIndex];
    allPaths += elem.getActualPathString();
  }
  return this.path(allPaths);
};

Agama.prototype.animateWall = function(sqTile, isHexagon) {
  // Now the animation and show part
  var wallAnimation = new Animation(this, this.getFullPathOfPattern().hide(), sqTile, isHexagon);
  wallAnimation.wallAct('start');
};

Agama.prototype.squareTemplate = function(sqTile) {
  var topX = sqTile.topX;
  var topY = sqTile.topY;
  var bottomX = sqTile.bottomX;
  var bottomY = sqTile.bottomY;
  var radius = sqTile.radius;

  var c0 = this.concircle(sqTile.x_center, sqTile.y_center, sqTile.radius);
  this.conline(topX, topY, bottomX, topY);
  this.conline(topX, topY, topX, bottomY);
  this.conline(bottomX, topY, bottomX, bottomY);
  this.conline(topX, bottomY, bottomX, bottomY);
  this.conline(topX + radius, topY, topX + radius, bottomY);
  this.conline(topX, topY + radius, bottomX, topY + radius);
  this.conline(topX, topY, bottomX, bottomY);
  this.conline(bottomX, topY, topX, bottomY);
  return c0;
};

Agama.prototype.hexagonTemplate = function(sqTile) {
  var c0 = this.concircle(sqTile.x_center, sqTile.y_center, sqTile.radius);
  var topX = sqTile.topX;
  var topY = sqTile.topY;
  var bottomX = sqTile.bottomX;
  var bottomY = sqTile.bottomY;
  var radius = sqTile.radius;

  this.conline(topX + radius, topY, topX + radius, bottomY);
  var t1 = this.conline(topX, topY + radius, bottomX, topY + radius);
  this.concircle(topX + radius, topY, radius);
  this.concircle(topX + radius, bottomY, radius);
  this.concircle(topX, topY + radius, radius);
  this.concircle(bottomX, topY + radius, radius);
  this.conline(c0.getIntersectPoint(1), c0.getIntersectPoint(10));
  this.conline(c0.getIntersectPoint(2), c0.getIntersectPoint(9));
  this.conline(c0.getIntersectPoint(3), c0.getIntersectPoint(8));
  this.conline(c0.getIntersectPoint(4), c0.getIntersectPoint(7));
  var t2 = this.conline(c0.getIntersectPoint(1), c0.getIntersectPoint(2));
  var t3 = this.conline(c0.getIntersectPoint(1), c0.getIntersectPoint(5));
  var t4 = this.conline(c0.getIntersectPoint(2), c0.getIntersectPoint(6));
  var t5 = this.conline(c0.getIntersectPoint(6), c0.getIntersectPoint(10));
  var t6 = this.conline(c0.getIntersectPoint(10), c0.getIntersectPoint(9));
  var t7 = this.conline(c0.getIntersectPoint(5), c0.getIntersectPoint(9));
  return { c0: c0, t1: t1, t2:t2, t3: t3, t4: t4, t5: t5, t6:t6, t7:t7};
};

// (done, 11/15) Transformations on line
// (done, actualAttr, 11/14) Decide on whether to update on transformation or on actualAttr
// (done, 11/13) Rename __Circles__ to __shapes__ -> __elements__ (11/15)
// (Done)Always sort intersection points by X, so that you can save pivot math.
// (done, 11/11) When three lines intersect, they should always be on the same point and not create a new point
// (done, 11/11)Too many intersection points on first pattern
// (done, 11/10) Line segments should not intersect outside of the box.
// (done, 11/11)Figure out formula for line segments
// (done, 11/14) Write tests for agamageometry
// (done, 11/14, except for agama.js) Write tests for everything
// (won't do, uses native sorting, 11/15)Instead of resorting, should always insert the right place
// (done, even better, I did it into a class, 11/16) Make animation into a function
// Write tests for Agama.js
// When you transform, intersections change
// Add 4 more patterns
// Should I also make templates?
// Make Geometry static.
// Make animation find the dimentions by itself.
