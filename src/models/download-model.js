'use strict';

var Backbone = require('backbone');

var Config = require('../config');

module.exports = Backbone.Model.extend({
  fileUrl: function() {
    return Config.BACKEND_URL + "/" + this.get('dataFile');
  }
});
