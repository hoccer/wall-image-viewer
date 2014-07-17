'use strict';

var _ = require('underscore');

var RECONNECT_TIMEOUT = 10;

var CollectionUpdater = module.exports = function(url) {
  this._socket = null;
  this._subscriptions = {};
  this._url = url;

  this._connect();
};

CollectionUpdater.prototype._connect = function() {
  try {
    this._socket = new WebSocket(this._url);
    this._socket.onopen = this._onopen.bind(this);
    this._socket.onmessage = this._onmessage.bind(this);
    this._socket.onclose = this._onclose.bind(this);
  } catch (exception) {
    this._scheduleReconnect();
  }
};

CollectionUpdater.prototype._scheduleReconnect = function() {
  console.warn(
    'No connection to ' + this._url +
    ', retrying in ' + RECONNECT_TIMEOUT + ' seconds.'
  );

  setTimeout(this._connect.bind(this), RECONNECT_TIMEOUT * 1000);
};

CollectionUpdater.prototype.subscribe = function(path, collection, filter) {
  var subscription = {
    collection: collection,
    filter: filter
  };

  this._subscriptions[path] = _.union(
    this._subscriptions[path] || [],
    subscription
  );

  this._doSubscribe(path);
};

CollectionUpdater.prototype._doSubscribe = function(path) {
  this._send({
    command: 'subscribe',
    path: path
  });
};

CollectionUpdater.prototype._onopen = function() {
  _.each(_.keys(this._subscriptions), this._doSubscribe.bind(this));
};

CollectionUpdater.prototype._onmessage = function(event) {
  var message = JSON.parse(event.data);

  _.each(this._subscriptions[message.path], function(subscription) {
    var filter = subscription.filter;
    var object = message.data;

    if (!filter || filter(object)) {
      subscription.collection.add(object, {at: 0, merge: true});
    }
  });
};

CollectionUpdater.prototype._onclose = function() {
  this._scheduleReconnect();
};

CollectionUpdater.prototype._send = function(payload) {
  if (this._socket && this._socket.readyState === WebSocket.OPEN) {
    this._socket.send(JSON.stringify(payload));
  }
};
