/** @jsx React.DOM */

'use strict';

var Backbone = require('backbone');
var React = require('react');
var jQuery = require('jquery');

var Config = require('./config');
var DownloadCollection = require('./models/download-collection');
var ImageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

// Redirect all local AJAX requests to backend server
jQuery.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  if (options.url[0] == '/') {
    options.url = Config.BACKEND_URL + options.url;
  }
});

var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}});

// ---8<-----------------------------------------------------------------------

var updatesUrl = Config.BACKEND_URL.replace('http', 'ws') + '/updates';
var socket = new WebSocket(updatesUrl);

socket.onopen = function() {
  socket.send(JSON.stringify({
    command: 'subscribe',
    path: '/api/downloads'
  }));
};

socket.onmessage = function(event) {
  var object = JSON.parse(event.data);

  if (object.hasOwnProperty('clientDownloadId')) {
    images.add(object, {merge: true});
  }
};

// ---8<-----------------------------------------------------------------------

React.renderComponent(
  /* jshint ignore:start */
  <ImageGridView collection={images} />,
  /* jshint ignore:end */
  document.body);
