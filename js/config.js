'use strict';

var querystring = require('querystring');
var _ = require('underscore');

var defaults = {
  backendUrl: '',  // URL of the WebClient Backend, including schema
  numCells: 15,    // number of cells in the image grid
  updateDelay: 2   // minimum interval between incoming images, in seconds
};

var query = querystring.parse(window.location.search.substr(1));
var config = _.chain(query)
  .pick(_.keys(defaults))
  .defaults(defaults)
  .value();

module.exports = config;
