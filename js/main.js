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

// Update image slots when image collection changes

var NUM_SLOTS = 15;

var imageStream = Bacon.fromEventTarget(images, 'add').take(NUM_SLOTS);

var shuffledSlots = _.map(_.shuffle(_.range(NUM_SLOTS)), function(number) {
  return $('#slot-' + number);
});

var shuffledSlotIdStream = imageStream
  .map(1).scan(0, function(x, y) {
    return x + y;
  })
  .map(function(count) {
    return shuffledSlots[count % shuffledSlots.length];
  });

Bacon.zipAsArray(imageStream, shuffledSlotIdStream)
  .bufferingThrottle(1000)
  .onValue(function(value) {
    var image = value[0];
    var $slot = value[1];
    $slot.css('background-image', 'url(' + image.fileUrl() + ')');
  });
