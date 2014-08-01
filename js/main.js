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
  var image = params[0];
  var $cell = params[1];
  $cell.css('background-image', 'url(' + image.fileUrl() + ')');
  $cell.attr('data-image-id', image.id);
};

var removeImageFromGrid = function(image) {
  var $cell = $('[data-image-id="' + image.id + '"]');
  $cell.css('background-image', '');
};

// Initialize image collection
var images = new WebClient.Model.DownloadCollection(null, {
  backendUrl: config.backendUrl
});

images.fetch({data: {mediaType: 'image'}}).then(function() {
  // Use approved images only
  var approvedImages = new WebClient.Model.DownloadCollection(
    images.where({approvalState: 'APPROVED'}),
    {backendUrl: config.backendUrl}
  );

  // Initialize the grid
  var shuffledCells = _.chain(_.range(config.numCells))
    .shuffle()
    .map(function(number) {
      return $('#cell-' + number);
    })
    .value();

  var initialNumCells = Math.min(approvedImages.length, config.numCells);

  approvedImages.chain()
    .take(initialNumCells)
    .zip(_.take(shuffledCells, initialNumCells))
    .each(addImageToCell);

  // Update image collection with WebSocket updates
  var updateUrl = function(backendUrl) {
    var url = backendUrl ?
              backendUrl.replace('http', 'ws') :
              'ws://' + window.location.host;
    return url + '/updates';
  };

  var observer = new WebClient.WebSocket.Observer(updateUrl(config.backendUrl));
  observer.subscribe('/api/downloads', function(attributes) {
    var download = new WebClient.Model.DownloadModel(attributes);

    if (download.get('mediaType') === 'image') {
      if (download.get('approvalState') === 'APPROVED') {
        approvedImages.add(download, {at: 0, merge: true});
      } else {
        approvedImages.remove(download);
        removeImageFromGrid(download);
      }
    }
  });

  // Load data for new images
  var imageStream = Bacon.fromEventTarget(approvedImages, 'add');

  var loadedImageStream = imageStream
    .flatMap(function(image) {
      var imageElement = new Image();
      imageElement.src = image.fileUrl();

      return Bacon.mergeAll(
        Bacon.fromEventTarget(imageElement, 'load'),
        Bacon.fromEventTarget(imageElement, 'error')
      ).take(1).map(function() {
        return image;
      });
    });

  // Throttle incoming images
  var throttledImageStream = loadedImageStream
    .bufferingThrottle((config.fullscreenDuration + config.nextImageDelay))
    .filter(function(image) {
      // Throw out images that have been rejected in the meantime
      return approvedImages.contains(image);
    });

  // Show new images fullscreen
  var $overlay = $('#overlay');
  var $zoomImage = $('#zoom-image');

  throttledImageStream
    .onValue(function(image) {
      $zoomImage.attr('src', image.fileUrl());
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
      return shuffledCells[(initialNumCells + count) % shuffledCells.length];
    });

  Bacon.zipAsArray(hideImageStream, shuffledCellStream)
    .onValue(addImageToCell);
});
