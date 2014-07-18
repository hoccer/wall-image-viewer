/** @jsx React.DOM */

'use strict';

var Backbone = require('backbone');
var React = require('react');
var jQuery = require('jquery');

var CollectionUpdater = require('./collection-updater');
var Config = require('./config');
var DownloadCollection = require('./models/download-collection');
var ImageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

// Initialize image collection
var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}});

// Update image collection with WebSocket updates
var updateUrl = Config.BACKEND_URL.replace('http', 'ws') + '/updates';
var updater = new CollectionUpdater(updateUrl);
updater.subscribe('/api/downloads', images, function(download) {
  return download.mediaType === 'image';
});

// Render root view component
React.renderComponent(
  /* jshint ignore:start */
  <ImageGridView collection={images} />,
  /* jshint ignore:end */
  document.body);
