'use strict';

var Backbone = require('backbone');
var Bacon = require('baconjs');
var WebClient = require('talk-webclient-js-model');
var $ = require('jquery');
var _ = require('underscore');

var config = require('./config');
var Grid = require('./grid');
var Lightbox = require('./lightbox');

// Help Backbone find jQuery
Backbone.$ = $;

// Helpers
var preloadImage = function(image) {
  var deferred = new $.Deferred();
  var imageElement = new Image();

  imageElement.onload = deferred.resolve.bind(deferred);
  imageElement.onerror = deferred.reject.bind(deferred);
  imageElement.src = image.fileUrl();

  return deferred.promise();
};

// Initialize grid
var $cells = _.map(_.range(config.numCells), function(number) {
  return $('#cell-' + number);
});

var grid = new Grid($cells);

// Initialize fullscreen overlay
var lightbox = new Lightbox($('#overlay'), $('#zoom-image'));

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

  // Prefill grid
  approvedImages.chain()
    .take(config.numCells)
    .each(grid.addImage.bind(grid));

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
        grid.removeImage(download);

        var replacementImage = approvedImages.find(function(image) {
          return !grid.containsImage(image);
        });
        
        if (replacementImage) {
          grid.addImage(replacementImage);
        }

        if (lightbox.shows(download)) {
          lightbox.hide();
        }
      }
    }
  });

  // Load data for new images
  var imageStream = Bacon.fromEventTarget(approvedImages, 'add');

  var loadedImageStream = imageStream
    .flatMap(function(image) {
      return Bacon.fromPromise(preloadImage(image))
        .map(function() {
          return image;
        });
    });

  // Throttle incoming images
  var throttledImageStream = loadedImageStream
    .bufferingThrottle(config.fullscreenDuration + config.nextImageDelay);

  // Show new images fullscreen
  throttledImageStream
    .filter(approvedImages.contains.bind(approvedImages))
    .onValue(function(image) {
      lightbox.show(image);
    });

  // Hide images again
  throttledImageStream
    .delay(config.fullscreenDuration)
    .filter(approvedImages.contains.bind(approvedImages))
    .onValue(function(image) {
      lightbox.hide();
      grid.addImage(image);
    });
});
