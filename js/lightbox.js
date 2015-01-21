'use strict';

var Lightbox = module.exports = function($overlay, $image) {
  this.$overlay = $overlay;
  this.$image = $image;
  this._image = null;
};

Lightbox.prototype.show = function(image) {
  var _this = this;
  this.$image.on('load', function() {
    _this.$overlay.removeClass('hidden');
  });

  this.$image.attr('src', image.fileUrl());
  this._image = image;
};

Lightbox.prototype.hide = function() {
  this.$image.off('load');
  this.$overlay.addClass('hidden');
  this._image = null;
};

Lightbox.prototype.shows = function(image) {
  return this._image && this._image.id === image.id;
};
