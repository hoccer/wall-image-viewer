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
  var imageModel = params[0];
  var $cell = params[1];
  $cell.css('background-image', 'url(' + imageModel.fileUrl() + ')');
};

// Initialize image collection
var imageCollection = new DownloadCollection();
imageCollection.fetch({data: {mediaType: 'image'}}).then(function() {
  // Initialize the grid
  var shuffledCells = _.chain(_.range(config.numCells))
    .shuffle()
    .map(function(number) {
      return $('#cell-' + number);
    })
    .value();

  _.each(_.zip(imageCollection.take(config.numCells), shuffledCells), addImageToCell);

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
      imageCollection.add(download, {at: 0, merge: true});
    }
  });

  // Load data for new images
  var imageModelStream = Bacon.fromEventTarget(imageCollection, 'add')
    .bufferingThrottle((config.fullscreenDuration + config.nextImageDelay));

  var imageElementStream = imageModelStream
    .flatMap(function(imageModel) {
      var imageElement = new Image();
      imageElement.src = imageModel.fileUrl();

      return Bacon.mergeAll(
        Bacon.fromEventTarget(imageElement, 'load'),
        Bacon.fromEventTarget(imageElement, 'error')
      ).take(1);
    });

  var loadedImageModelStream = imageModelStream
    .zip(imageElementStream, function(imageModel) {
      return imageModel;
    });

  // Show new images fullscreen
  var $overlay = $('#overlay');
  var $zoomImage = $('#zoom-image');

  loadedImageModelStream
    .onValue(function(imageModel) {
      $zoomImage.attr('src', imageModel.fileUrl());
      $overlay.removeClass('hidden');
    });

  var hideImageStream = loadedImageModelStream
    .delay(config.fullscreenDuration);

  hideImageStream
    .onValue(function() {
      $overlay.addClass('hidden');
    });

  // Add new images to grid when leaving fullscreen
  var shuffledCellStream = loadedImageModelStream
    .map(1).scan(0, function(x, y) {
      return x + y;
    })
    .map(function(count) {
      return shuffledCells[count % shuffledCells.length];
    });

  Bacon.zipAsArray(hideImageStream, shuffledCellStream)
    .onValue(addImageToCell);

});
