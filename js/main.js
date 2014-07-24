'use strict';

var Backbone = require('backbone');
var Bacon = require('baconjs');
var $ = require('jquery');
var _ = require('underscore');

var WebSocketObserver = require('./websocket-observer');
var config = require('./config');
var DownloadCollection = require('./models/download-collection');

// Help Backbone find jQuery
Backbone.$ = $;

var addImageToCell = function(params) {
  var image = params[0];
  var $cell = params[1];
  $cell.css('background-image', 'url(' + image.fileUrl() + ')');
};

// Initialize image collection
var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}}).then(function() {
  // Initialize the grid
  var shuffledCells = _.chain(_.range(config.numCells))
    .shuffle()
    .map(function(number) {
      return $('#cell-' + number);
    })
    .value();

  _.each(_.zip(images.take(config.numCells), shuffledCells), addImageToCell);

  // Update image collection with WebSocket updates
  var updateUrl = function(backendUrl) {
    var url = backendUrl ?
              backendUrl.replace('http', 'ws') :
              'ws://' + window.location.host;
    return url + '/updates';
  };

  var observer = new WebSocketObserver(updateUrl(config.backendUrl));
  observer.subscribe('/api/downloads', function(download) {
    if (download.mediaType === 'image') {
      images.add(download, {at: 0, merge: true});
    }
  });

  // Show new images fullscreen
  var imageStream = Bacon.fromEventTarget(images, 'add')
    .bufferingThrottle((config.fullscreenDuration + config.nextImageDelay));

  var $overlay = $('#overlay');
  var $zoomImage = $('#zoom-image');

  imageStream
    .onValue(function(image) {
      $zoomImage.attr('src', image.fileUrl());
      $overlay.removeClass('hidden');
    });

  var hideImageStream = imageStream
    .delay(config.fullscreenDuration);

  hideImageStream
    .onValue(function() {
      $overlay.addClass('hidden');
    });

  // Add new images to grid when leaving fullscreen
  var shuffledCellStream = imageStream
    .map(1).scan(0, function(x, y) {
      return x + y;
    })
    .map(function(count) {
      return shuffledCells[count % shuffledCells.length];
    });

  Bacon.zipAsArray(hideImageStream, shuffledCellStream)
    .onValue(addImageToCell);

});
