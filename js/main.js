'use strict';

var Backbone = require('backbone');
var React = require('react');
var jQuery = require('jquery');

var CollectionUpdater = require('./collection-updater');
var config = require('../config.json');
var DownloadCollection = require('./models/download-collection');
var imageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

// Initialize image collection
var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}});

// Update image collection with WebSocket updates
var updateUrl = config.backendUrl.replace('http', 'ws') + '/updates';
var updater = new CollectionUpdater(updateUrl);
updater.subscribe('/api/downloads', images, function(download) {
  return download.mediaType === 'image';
});

// Render root view component
React.renderComponent(imageGridView({collection: images}), document.body);
