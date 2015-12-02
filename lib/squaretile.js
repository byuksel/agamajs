/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file SquareTile Module. Defines a square tile with some helper methods.
 */
if (typeof exports !== 'undefined') {
  exports = module.exports = SquareTile;
  var Utils = require('./utils.js');
}

/**
 * Constructs a new SquareTile
 *
 * @param {number} topX - X coordinate of the top-left point.
 * @param {number} topY - Y coordinate of the top-left point.
 * @param {number} bottomX - X coordinate of the bottom-right point.
 * @param {number} bottomY - Y coordinate of the bottom-right point.
 *
 * @throws Will throw an error if topX is bigger than bottomX or
 *         topY is bigger than bottomY
 *
 * @constructor
 */
function SquareTile(topX, topY, bottomX, bottomY) {
  if (topX > bottomX) {
    throw new Error('topX:' + topX + ' is bigger than bottomX:' + bottomX);
  }
  if (topY > bottomY) {
    throw new Error('topY:' + topY + ' is bigger than bottomY:' + bottomY);
  }
  this.topX = topX;
  this.topY = topY;
  this.bottomX = bottomX;
  this.bottomY = bottomY;
  this.radius = (bottomX - topX) / 2;
  this.xCenter = (topX + bottomX) / 2;
  this.yCenter = (topY + bottomY) / 2;
  this.side = bottomX - topX;
}

/**
 * Returns true if point is in or on the square tile.
 *
 * @param {number} x - X coordinate of the first point.
 * @param {number} y - Y coordinate of the first point.
 * @returns {boolean} - True is point is in or on the square tile.
 */
SquareTile.prototype.isInside = function(x, y) {
  return (x > this.topX || Utils.isFloatEqual(x, this.topX)) &&
         (x < this.bottomX || Utils.isFloatEqual(x, this.bottomX)) &&
         (y > this.topY || Utils.isFloatEqual(y, this.topY)) &&
         (y < this.bottomY || Utils.isFloatEqual(y, this.bottomY));
};

/**
 * Pushes the point as an object with {x:x, y:y} into the array
 * if (x,y) is inside or on the tile.
 *
 * @param {number} x - X coordinate of the point.
 * @param {number} y - Y coordinate of the point.
 * @param {Array} arr - Array where the point should be pushed to.
 */
SquareTile.prototype.pushIfInsideTile = function(x, y, arr) {
  if (this.isInside(x,y)) {
    arr.push({x: x, y: y});
  }
};
