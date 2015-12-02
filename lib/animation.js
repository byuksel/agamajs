/**
 * @copyright Copyright (c) 2015, Project Agama,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@projectagama.com>
 *
 * @file Animation module. Defines a variety of animations.
 */
if (typeof exports !== 'undefined') {
  exports = module.exports = Animation;
  var Utils = require('./animation.js');
}

/**
 * Constructs a new Animation.
 *
 * @param {Object} paper - paper objectof the animation.
 * @param {Object} fullPattern - full path of the pattern.
 * @param {Object} sqTile - sqTile of the pattern.
 * @param {boolean} isHexagon - whether the pattern on the square tile is hexagonal.
 * @returns {Object} - newly created Animation object.
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

/**
 * Implements a wall animation act.
 *
 * This is the main execution controller of wall act. This method transforms the
 * callback technique to a step-by-step procedural control. Each animation act
 * callsback this very function to indicate that they are done. This method then
 * calls the next act in the sequence.
 *
 * This technique is not heap efficient, it keeps on accumulating calls to this
 * method on the heap. But since the code is just simple if-then-else statements,
 * there is not much to worry about heap space.
 *
 *
 * @param {string} whichStage - the stage and status of the wall act.
 */
Animation.prototype.wallAct = function(whichStage) {
  if (whichStage === 'start') {
    this.animateConstructionElements(this.paper.getConstructionElements(), 0);
  } else if (whichStage === 'constructionelements_done') {
    this.animatePattern(this.paper, this.fullPattern, 0,
                        this.fullPatternLength / 20,
                        this.fullPatternLength, this.partialPaths);
  } else if (whichStage === 'pattern_done') {
    this.dimConstructionElements(this.paper.getConstructionElements());
  } else if (whichStage === 'dimconstructionelements_done') {
    this.animateDance(this.fullPattern, this.partialPaths,
                      this.sqTile, this.isHexagon, this.finalX);
  } else if (whichStage === 'dance_done') {
    this.animateTiling(this.fullPattern, this.isHexagon, this.finalX,
                       'red', 3, 1.0);
  }
};

/**
 * Implements and runs the animate tiling section of wall act.
 *
 * @param {Object} fullPattern - full path of the pattern.
 * @param {boolean} isHexagon - whether the pattern on the square tile is hexagonal.
 * @param {number} finalX - padding to be added to the placement of the animated tile.
 * @param {string} newColor - new color of the animated pattern.
 * @param {number} newWidth - new width of the animated pattern.
 * @param {number} newOpacity - new opacity of the animated pattern.
 */
Animation.prototype.animateTiling = function(fullPattern, isHexagon, finalX,
                                             newColor, newWidth, newOpacity) {
  fullPattern.animate({fill: '#223fa3', stroke: newColor,
                       'stroke-width': newWidth,
                       'stroke-opacity': newOpacity}, 2000);
  for (var i = -3; i < 4; i++) {
    for (var j = -1; j < 2; j++) {
      var newX = finalX * i;
      var newY = finalX * j;
      newX = isHexagon && (j % 2) ? newX + finalX / 2 : newX;
      newY = isHexagon ? newY * 0.866 : newY;
      fullPattern.clone().attr('opacity', 1.0).transform(
        's0.5T' + newX + ',' + newY).animate({fill: '#223fa3', stroke: newColor,
                                              'stroke-width': newWidth,
                                              'stroke-opacity': newOpacity},
                                             2000);
    }
  }
};

/**
 * Implements and runs the animate pattern section of wall act.
 *
 * @param {Object} paper - paper of the pattern.
 * @param {Object} fullPattern - full path of the pattern.
 * @param {number} current - current completed length.
 * @param {number} step - how much do we draw at each step?
 * @param {number} final - final length of the path.
 * @param {Object} partialPaths - the array to push the partial paths drawn at each stage.
 */
Animation.prototype.animatePattern = function(
  paper, fullPattern, current, step, final, partialPaths) {
  var parent = this;
  if (current < final) {
    current += step;
    current = current > final ? final : current;
    var subpath = fullPattern.getSubpath(0, current);
    partialPaths.push(
      paper.path(subpath).attr('stroke', 'red').attr('stroke-width', 3));
    setTimeout(function() {
      parent.animatePattern(paper, fullPattern, current,
                            step, final, partialPaths);
    } , 200);
  } else {
    this.wallAct('pattern_done');
  }
};

/**
 * Implements and runs dim construction elements stage.
 *
 * @param {Array<Object>} constructionElements - construction elements array.
 */
Animation.prototype.dimConstructionElements = function(constructionElements) {
  var parent = this;
  var lines = this.paper.set();
  for (var elemIndex = 0; elemIndex < constructionElements.length;
       elemIndex++) {
    var elem = constructionElements[elemIndex];
    lines.push(elem);
  }
  lines.animate({opacity: 0}, 1000,
                function() {parent.wallAct('dimconstructionelements_done');});
};

/**
 * Implements and runs animate construction elements stage.
 *
 * @param {Array<Object>} constructionElements - construction elements array.
 * @param {number} animateIndex - the index of the construction elements array which
 *                                indicates the element to be animated.
 */
Animation.prototype.animateConstructionElements = function(constructionElements,
                                                           animateIndex) {
  var parent = this;
  if (animateIndex < constructionElements.length) {
    constructionElements[animateIndex++].animate(
      {opacity: '1'}, 200,
      function() { parent.animateConstructionElements(constructionElements,
                                                      animateIndex); });
  } else {
    this.wallAct('constructionelements_done');
  }
};

/**
 * Implements and runs animate dance stage. This is when the pattern spins on the wall.
 *
 * Implements and runs the animate tiling section of wall act.
 *
 * @param {Object} fullPattern - full path of the pattern.
 * @param {Object} partialPaths - the array of partial paths of the full pattern.
 * @param {Object} sqTile - sqTile of the pattern.
 * @param {boolean} isHexagon - whether the pattern on the square tile is hexagonal.
 * @param {number} finalX - padding to be added to the placement of the animated tile.
 */
Animation.prototype.animateDance = function(fullPattern, partialPaths,
                                            sqTile, isHexagon, finalX) {
  var parent = this;
  fullPattern.attr('stroke', 'red').attr('stroke-width', 3).show();
  for (var elemIndex = 0; elemIndex < partialPaths.length; elemIndex++) {
    var elem = partialPaths[elemIndex];
    elem.remove();
  }
  var transY = isHexagon ? finalX / 2 / 0.8 : 0;
  var transformStr = 'r90,' + sqTile.topX + ',' + sqTile.topY + 'r90s0.5t-' +
        (finalX * 2 + transY) + ',0';
  fullPattern.animate({transform: transformStr},
                      1000, function() { parent.wallAct('dance_done');});
};
