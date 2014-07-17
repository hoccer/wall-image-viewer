'use strict';

var _ = require('underscore');

var CollectionUpdater = module.exports = function(url) {
  this.socket = null;
  this.subscriptions = {};
  this.url = url;
};

CollectionUpdater.prototype.start = function() {
  this.socket = new WebSocket(this.url);
  this.socket.onopen = this._onopen.bind(this);
  this.socket.onmessage = this._onmessage.bind(this);
};

CollectionUpdater.prototype.subscribe = function(path, collection) {
  this.subscriptions[path] = _.union(
    this.subscriptions[path] || [],
    collection
  );

  this._doSubscribe(path, collection);
};

CollectionUpdater.prototype._doSubscribe = function(path, collection) {
  this._send({
    command: 'subscribe',
    path: path
  });
};

CollectionUpdater.prototype._onopen = function() {
  _.each(_.keys(this.subscriptions), function(path) {
    _.each(this.subscriptions[path], this._doSubscribe.bind(this, path));
  }, this);
};

CollectionUpdater.prototype._onmessage = function(event) {
  var message = JSON.parse(event.data);

  _.each(this.subscriptions[message.path], function(collection) {
    collection.add(message.data, {at: 0, merge: true});
  });
};

CollectionUpdater.prototype._send = function(payload) {
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    this.socket.send(JSON.stringify(payload));
  }
};
