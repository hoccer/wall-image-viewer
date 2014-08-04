'use strict';

var Lightbox = module.exports = function($overlay, $image) {
  this.$overlay = $overlay;
  this.$image = $image;
  this._image = null;
};

Lightbox.prototype.show = function(image) {
  this.$image.attr('src', image.fileUrl());
  this.$overlay.removeClass('hidden');
  this._image = image;
};

Lightbox.prototype.hide = function() {
  this.$overlay.addClass('hidden');
  this._image = null;
};

Lightbox.prototype.shows = function(image) {
  return this._image && this._image.id === image.id;
};
