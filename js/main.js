'use strict';

var Backbone = require('backbone');
var jQuery = require('jquery');
var React = require('react');

var CollectionUpdater = require('./collection-updater');
var config = require('./config');
var DownloadCollection = require('./models/download-collection');
var imageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

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

// Render root view component
React.renderComponent(imageGridView({collection: images}), document.body);
