'use strict';

var Backbone = require('backbone');

var DownloadModel = require('./download-model');

module.exports = Backbone.Collection.extend({
  model: DownloadModel,
  url: '/api/downloads'
});
