'use strict';

var _ = require('underscore');
var Promise = require('promise');

var RESTART_TIMEOUT = 10;

var CollectionUpdater = module.exports = function(url) {
  this._connectPromise = null;
  this._socket = null;
  this._subscriptions = {};
  this._url = url;
};

CollectionUpdater.prototype.start = function() {
  var _this = this;

  var promise = new Promise(function(resolve, reject) {
    if (_this._connection) {
      resolve();
    } else if (_this._connectPromise) {
      return _this._connectPromise.promise;
    } else {
      _this._connectPromise = {
        promise: promise,
        resolve: resolve,
        reject: reject
      };

      _this._socket = _this._openWebSocket(_this._url);
    }
  });

  return promise;
};

CollectionUpdater.prototype._openWebSocket = function(url) {
  var socket = null;

  try {
    socket = new WebSocket(url);
    socket.onopen = this._onopen.bind(this);
    socket.onmessage = this._onmessage.bind(this);
    socket.onclose = this._onclose.bind(this);
  } catch (exception) {
    // returning null socket
  }

  return socket;
};

CollectionUpdater.prototype.subscribe = function(path, collection) {
  this._subscriptions[path] = _.union(
    this._subscriptions[path] || [],
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
  _.each(_.keys(this._subscriptions), function(path) {
    _.each(this._subscriptions[path], this._doSubscribe.bind(this, path));
  }, this);

  this._connectPromise.resolve();
  this._connectPromise = null;
};

CollectionUpdater.prototype._onmessage = function(event) {
  var message = JSON.parse(event.data);

  _.each(this._subscriptions[message.path], function(collection) {
    collection.add(message.data, {at: 0, merge: true});
  });
};

CollectionUpdater.prototype._onclose = function() {
  if (this._connectPromise) {
    this._connectPromise.reject();
    this._connectPromise = null;
  }

  this._scheduleRestart();
};

CollectionUpdater.prototype._scheduleRestart = function() {
  console.warn(
    'No connection to ' + this._url +
    ', retrying in ' + RESTART_TIMEOUT + ' seconds.'
  );

  var _this = this;

  setTimeout(function () {
    _this.start().catch(_this._scheduleRestart.bind(_this));
  }, RESTART_TIMEOUT * 1000);
};

CollectionUpdater.prototype._send = function(payload) {
  if (this._socket && this._socket.readyState === WebSocket.OPEN) {
    this._socket.send(JSON.stringify(payload));
  }
};
