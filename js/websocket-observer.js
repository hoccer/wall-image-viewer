'use strict';

var _ = require('underscore');

var RECONNECT_TIMEOUT = 10;

var WebSocketObserver = module.exports = function(url) {
  this._socket = null;
  this._subscriptions = {};
  this._url = url;

  this._connect();
};

WebSocketObserver.prototype._connect = function() {
  try {
    this._socket = new WebSocket(this._url);
    this._socket.onopen = this._onopen.bind(this);
    this._socket.onmessage = this._onmessage.bind(this);
    this._socket.onclose = this._onclose.bind(this);
  } catch (exception) {
    console.error(exception);
    this._scheduleReconnect();
  }
};

WebSocketObserver.prototype._scheduleReconnect = function() {
  console.warn(
    'No connection to ' + this._url +
    ', retrying in ' + RECONNECT_TIMEOUT + ' seconds.'
  );

  setTimeout(this._connect.bind(this), RECONNECT_TIMEOUT * 1000);
};

WebSocketObserver.prototype.subscribe = function(path, callback) {
  this._subscriptions[path] = _.union(
    this._subscriptions[path] || [],
    callback
  );

  this._doSubscribe(path);
};

WebSocketObserver.prototype._doSubscribe = function(path) {
  this._send({
    command: 'subscribe',
    path: path
  });
};

WebSocketObserver.prototype._onopen = function() {
  console.log('Connected to ' + this._url);

  _.each(_.keys(this._subscriptions), this._doSubscribe.bind(this));
};

WebSocketObserver.prototype._onmessage = function(event) {
  var message = JSON.parse(event.data);

  _.each(this._subscriptions[message.path], function(callback) {
    callback(message.data);
  });
};

WebSocketObserver.prototype._onclose = function() {
  this._scheduleReconnect();
};

WebSocketObserver.prototype._send = function(payload) {
  if (this._socket && this._socket.readyState === WebSocket.OPEN) {
    this._socket.send(JSON.stringify(payload));
  }
};
