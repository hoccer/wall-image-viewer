'use strict';

var Backbone = require('backbone');
var Bacon = require('baconjs');
var WebClient = require('talk-webclient-js-model');
var $ = require('jquery');
var _ = require('underscore');

var config = require('./config');

// Help Backbone find jQuery
Backbone.$ = $;

var addImageToCell = function(params) {
  var imageModel = params[0];
  var $cell = params[1];
  $cell.css('background-image', 'url(' + imageModel.fileUrl() + ')');
};

// Initialize image collection
var imageCollection = new WebClient.Model.DownloadCollection(null, {
  backendUrl: config.backendUrl
});

imageCollection.fetch({data: {mediaType: 'image'}}).then(function() {
  // Initialize the grid
  var shuffledCells = _.chain(_.range(config.numCells))
    .shuffle()
    .map(function(number) {
      return $('#cell-' + number);
    })
    .value();

  imageCollection.chain()
    .take(config.numCells)
    .zip(_.take(shuffledCells, imageCollection.length))
    .each(addImageToCell);

  // Update image collection with WebSocket updates
  var updateUrl = function(backendUrl) {
    var url = backendUrl ?
              backendUrl.replace('http', 'ws') :
              'ws://' + window.location.host;
    return url + '/updates';
  };

  var observer = new WebClient.WebSocket.Observer(updateUrl(config.backendUrl));
  observer.subscribe('/api/downloads', function(download) {
    if (download.mediaType === 'image') {
      imageCollection.add(download, {at: 0, merge: true});
    }
  });

  // Load data for new images
  var imageStream = Bacon.fromEventTarget(imageCollection, 'add');

  var loadedImageStream = imageStream
    .flatMap(function(imageModel) {
      var imageElement = new Image();
      imageElement.src = imageModel.fileUrl();

      return Bacon.mergeAll(
        Bacon.fromEventTarget(imageElement, 'load'),
        Bacon.fromEventTarget(imageElement, 'error')
      ).take(1).map(function() {
        return imageModel;
      });
    });

  // Throttle incoming images
  var throttledImageStream = loadedImageStream
    .bufferingThrottle((config.fullscreenDuration + config.nextImageDelay));

  // Show new images fullscreen
  var $overlay = $('#overlay');
  var $zoomImage = $('#zoom-image');

  throttledImageStream
    .onValue(function(imageModel) {
      $zoomImage.attr('src', imageModel.fileUrl());
      $overlay.removeClass('hidden');
    });

  var hideImageStream = throttledImageStream
    .delay(config.fullscreenDuration);

  hideImageStream
    .onValue(function() {
      $overlay.addClass('hidden');
    });

  // Add new images to grid when leaving fullscreen
  var shuffledCellStream = throttledImageStream
    .map(1).scan(0, function(x, y) {
      return x + y;
    })
    .map(function(count) {
      return shuffledCells[count % shuffledCells.length];
    });

  Bacon.zipAsArray(hideImageStream, shuffledCellStream)
    .onValue(addImageToCell);
});
