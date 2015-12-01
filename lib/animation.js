/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Animation module. Defines all sorts of animations.
 */
if (typeof exports !== 'undefined') {
  exports = module.exports = Animation;
  var Utils = require('./animation.js');
}

/**
 * Constructs a new Animation
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
function Animation(paper, fullPattern, sqTile, isHexagon) {
  this.paper = paper;
  this.fullPattern = fullPattern;
  this.fullPatternLength = fullPattern.getTotalLength();
  this.sqTile = sqTile;
  this.isHexagon = isHexagon;
  this.finalX = isHexagon ? sqTile.side * 0.866 / 2 : sqTile.side / 2;
  this.partialPaths = paper.set();
}

Animation.prototype.wallAct = function(whichStage) {
  if (whichStage === 'start') {
    this.animateConstructionElements(this.paper.getConstructionElements(), 0);
  } else if (whichStage === 'constructionelements_done') {
    this.animatePattern(this.paper, this.fullPattern, 0, this.fullPatternLength / 20,
                        this.fullPatternLength, this.partialPaths);
  } else if (whichStage === 'pattern_done') {
    this.dimConstructionElements(this.paper.getConstructionElements());
  } else if (whichStage === 'dimconstructionelements_done') {
    this.animateDance(this.fullPattern, this.partialPaths,
                      this.sqTile, this.isHexagon, this.finalX);
  } else if (whichStage === 'dance_done') {
    this.animateTiling(this.fullPattern, this.isHexagon, this.finalX, 'red', 3, 1.0);
  }
};

Animation.prototype.animateTiling = function(fullPattern, isHexagon, finalX, newColor, newWidth, newOpacity) {
  fullPattern.animate({fill: '#223fa3', stroke: newColor, 'stroke-width': newWidth, 'stroke-opacity': newOpacity}, 2000);
  for (var i = -3; i < 4; i++) {
    for (var j = -1; j < 2; j++) {
      var newX = finalX * i;
      var newY = finalX * j;
      newX = isHexagon && (j % 2) ? newX + finalX / 2 : newX;
      newY = isHexagon ? newY * 0.866 : newY;
      fullPattern.clone().attr('opacity', 1.0).transform('s0.5T' + newX + ',' + newY).animate(
        {fill: '#223fa3', stroke: newColor, 'stroke-width': newWidth, 'stroke-opacity': newOpacity}, 2000);
    }
  }
};

Animation.prototype.animatePattern = function(paper, fullPattern, current, step, final, partialPaths) {
  var parent = this;
  if (current < final) {
    current += step;
    current = current > final ? final : current;
    var subpath = fullPattern.getSubpath(0, current);
    partialPaths.push(paper.path(subpath).attr('stroke', 'red').attr('stroke-width', 3));
    setTimeout(function() {parent.animatePattern(paper, fullPattern, current, step, final, partialPaths);} , 200);
  } else {
    this.wallAct('pattern_done');
  }
};

Animation.prototype.dimConstructionElements = function(constructionElements) {
  var parent = this;
  var lines = this.paper.set();
  for (var elemIndex = 0; elemIndex < constructionElements.length; elemIndex++) {
    var elem = constructionElements[elemIndex];
    lines.push(elem);
  }
  lines.animate({opacity: 0}, 1000, function() {parent.wallAct('dimconstructionelements_done');});
};

Animation.prototype.animateConstructionElements = function(constructionElements, animateIndex) {
  var parent = this;
  if (animateIndex < constructionElements.length) {
    constructionElements[animateIndex++].animate(
      {opacity: '1'}, 200,
      function() { parent.animateConstructionElements(constructionElements, animateIndex); });
  } else {
    this.wallAct('constructionelements_done');
  }
};

Animation.prototype.animateDance = function(fullPattern, partialPaths, sqTile, isHexagon, finalX) {
  var parent = this;
  fullPattern.attr('stroke', 'red').attr('stroke-width', 3).show();
  for (var elemIndex = 0; elemIndex < partialPaths.length; elemIndex++) {
    var elem = partialPaths[elemIndex];
    elem.remove();
  }
  var transY = isHexagon ? finalX / 2 / 0.8 : 0;
  var transformStr = 'r90,' + sqTile.topX + ',' + sqTile.topY + 'r90s0.5t-' + (finalX * 2 + transY) + ',0';
  fullPattern.animate({transform: transformStr},
                      1000, function() { parent.wallAct('dance_done');});
};
