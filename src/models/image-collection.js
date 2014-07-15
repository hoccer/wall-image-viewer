'use strict';

var Backbone = require('backbone');

var ImageModel = require('./image-model');

module.exports = Backbone.Collection.extend({
  model: ImageModel,
  url: '/downloads'
});
