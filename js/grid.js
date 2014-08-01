'use strict';

var $ = require('jquery');
var _ = require('underscore');

var Grid = module.exports = function($cells) {
  this._$cells = $cells;
  this._$nextCells = [];
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
  $cell.attr('data-image-id', image.id);
};

Grid.prototype.removeImage = function(image) {
  var $cell = $('[data-image-id="' + image.id + '"]');
  $cell.css('background-image', '');
  this._$nextCells.push($cell);
};
