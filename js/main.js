'use strict';

var Backbone = require('backbone');
var Bacon = require('baconjs');
var $ = require('jquery');
var _ = require('underscore');

var CollectionUpdater = require('./collection-updater');
var config = require('./config');
var DownloadCollection = require('./models/download-collection');

// Help Backbone find jQuery
Backbone.$ = $;

// Initialize image collection
var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}});

// Update image collection with WebSocket updates
var updateUrl = function(backendUrl) {
  var url = backendUrl ?
            backendUrl.replace('http', 'ws') :
            'ws://' + window.location.host;
  return url + '/updates';
};

var updater = new CollectionUpdater(updateUrl(config.backendUrl));
updater.subscribe('/api/downloads', images, function(download) {
  return download.mediaType === 'image';
});

// Update image cells when image collection changes

var imageStream = Bacon.fromEventTarget(images, 'sync')
  .take(1)
  .mapEnd()
  .flatMap(function(collection) {
    if (collection) {
      return Bacon.fromArray(collection.take(config.numCells));
    } else {
      return Bacon.fromEventTarget(images, 'add')
        .bufferingThrottle(1000);
    }
  });

var shuffledCells = _.chain(_.range(config.numCells))
  .shuffle()
  .map(function(number) {
    return $('#cell-' + number);
  })
  .value();

var shuffledCellStream = imageStream
  .map(1).scan(0, function(x, y) {
    return x + y;
  })
  .map(function(count) {
    return shuffledCells[count % shuffledCells.length];
  });

Bacon.zipAsArray(imageStream, shuffledCellStream)
  .onValue(function(value) {
    var image = value[0];
    var $cell = value[1];
    $cell.css('background-image', 'url(' + image.fileUrl() + ')');
  });
