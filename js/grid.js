'use strict';

var _ = require('underscore');

var Grid = module.exports = function($cells) {
  this._$cells = $cells;
  this._$nextCells = [];
  this._$cellForImageId = {};
};

Grid.prototype._nextCell = function() {
  if (this._$nextCells.length === 0) {
    this._$nextCells = _.shuffle(this._$cells);
  }

  return this._$nextCells.pop();
};

Grid.prototype.addImage = function(image) {
  var $cell = this._nextCell();
  $cell.css('background-image', 'url(' + image.fileUrl() + ')');
  this._$cellForImageId[image.id] = $cell;
};

Grid.prototype.removeImage = function(image) {
  var $cell = this._$cellForImageId[image.id];

  if ($cell) {
    this._$cellForImageId[image.id] = null;
    $cell.css('background-image', '');
    this._$nextCells.push($cell);
  }
};

Grid.prototype.containsImage = function(image) {
  return !!this._$cellForImageId[image.id];
};
