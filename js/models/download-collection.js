'use strict';

var Backbone = require('backbone');

var Config = require('../config');
var DownloadModel = require('./download-model');

module.exports = Backbone.Collection.extend({
  model: DownloadModel,
  url: Config.BACKEND_URL + '/api/downloads'
});
