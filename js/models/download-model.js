'use strict';

var Backbone = require('backbone');

var config = require('../../config.json');

module.exports = Backbone.Model.extend({
  idAttribute: 'clientDownloadId',

  fileUrl: function() {
    return config.backendUrl + '/' + this.get('dataFile');
  }
});
