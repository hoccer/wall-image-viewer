/** @jsx React.DOM */

'use strict';

var Backbone = require('backbone');
var React = require('react');
var jQuery = require('jquery');

var DownloadCollection = require('./models/download-collection');
var ImageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

// Redirect all local AJAX requests to backend server
jQuery.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  if (options.url[0] == '/') {
    options.url = "http://0.0.0.0:8080" + options.url;
  }
});

var images = new DownloadCollection();
images.fetch({data: {mediaType: 'image'}});

React.renderComponent(
  /* jshint ignore:start */
  <ImageGridView collection={images} />,
  /* jshint ignore:end */
  document.body);
