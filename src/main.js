/** @jsx React.DOM */

'use strict';

var Backbone = require('backbone');
var React = require('react');
var jQuery = require('jquery');

var ImageCollection = require('./models/image-collection');
var ImageGridView = require('./views/image-grid-view');

// Help Backbone find jQuery
Backbone.$ = jQuery;

// Redirect all local AJAX requests to backend server
jQuery.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  if (options.url[0] == '/') {
    options.url = "http://0.0.0.0:8080" + options.url;
  }
});

var images = new ImageCollection();
images.fetch();

React.renderComponent(
  /* jshint ignore:start */
  <ImageGridView collection={images} />,
  /* jshint ignore:end */
  document.body);
