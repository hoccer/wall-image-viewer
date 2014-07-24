'use strict';

var querystring = require('querystring');
var _ = require('underscore');

var defaults = {
  // URL of the WebClient Backend, including schema
  backendUrl: '',

  // number of cells in the image grid
  numCells: 15,

  // time new images are shown fullscreen, in seconds
  fullscreenDuration: 5000,

  // minimum delay before showing next image, in seconds
  nextImageDelay: 1000
};

var query = querystring.parse(window.location.search.substr(1));
var config = _.chain(query)
  .pick(_.keys(defaults))
  .defaults(defaults)
  .value();

module.exports = config;
