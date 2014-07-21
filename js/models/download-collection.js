'use strict';

var Backbone = require('backbone');

var config = require('../config');
var DownloadModel = require('./download-model');

module.exports = Backbone.Collection.extend({
  model: DownloadModel,
  url: config.backendUrl + '/api/downloads'
});