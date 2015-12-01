/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Utils module. Defines helper methods.
 */
if (typeof exports !== 'undefined') {
  exports = module.exports = Utils;
}

function Utils() {}

/**
 * @constant {number} EPSILON - epsilon value mostly used for float calculations
 */
Utils.EPSILON =  0.00000001;

/**
 * @constant {number} PRECISION - number of digits to be used in Utils.isPrecisionEqual().
 */
Utils.PRECISION =  1;

/**
 * Returns true if point is in or on the square tile.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @return{boolean} - True is point is in or on the square tile.
 */
Utils.isFloatEqual = function(x, y) {
  return Math.abs(x - y) < this.EPSILON;
};

/**
 * Returns 1 if (x1,y1) is greater than (x2, y2), -1 if opposite,
 * 0 if they are float-equal.
 *
 * (x1,y1) is greater than (x2,y2) if x1 is greater than x2, or
 * in the case x1 and x2 are float equal, y1 is greater than y2.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the first point.
 * @param {number} y2 - Y coordinate of the first point.
 * @return{Number} - Returns 1 if (x1,y1) is greater than (x2, y2),
 *                   -1 if smaller, 0 if they are float-equal.
 */
Utils.sortByXY = function(x1, y1, x2, y2) {
  if (this.isFloatEqual(x1, x2)) {
    if (this.isFloatEqual(y1, y2)) {
      return 0;
    }
    if (y1 > y2) {
      return 1;
    }
    return -1;
  }
  if (x1 > x2) {
    return 1;
  }
  return -1;
};

/**
 * Pushes the object into the array if it is not already in the array.
 *
 * Modifies the array parameter, does not return anything.
 *
 * @param {Array} arr - Array to be pushed to.
 * @param {object} elem - Object to be pushed.
 * @return {boolean} - True if pushed.
 */
Utils.pushIfUnique = function(arr, elem) {
  var isUnique = true;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === elem) {
      isUnique = false;
      break;
    }
  }
  if (isUnique)  arr.push(elem);
  return isUnique;
};

/**
 * Returns true if x and y are equal when rounded up to the number
 * of digits (defined by Utils.PRECISION) after the decimal point.
 *
 * @param {Number} x - first number.
 * @param {Number} y - second number.
 * @return{boolean} -  True if x and y are equal when rounded up to the number
 *                          of Utils.PRECISION digits after the decimal point.
 */
Utils.isPrecisionEqual = function(x, y) {
  //  return Math.round(x*10) === Math.round(y*10);
  return x.toFixed(this.PRECISION) === y.toFixed(this.PRECISION);
};

/**
 * Returns an SVG line string between first and second points.
 *
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the second point.
 * @param {number} y2 - Y coordinate of the second point.
 * @return{String} - Returns an SVG line string.
 *
 */
Utils.svgLineStr = function(x1, y1, x2, y2) {
  return String('M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2);
};
