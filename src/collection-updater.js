'use strict';

var _ = require('underscore');
var Promise = require('promise');

var RESTART_TIMEOUT = 10;

var CollectionUpdater = module.exports = function(url) {
  this.connectPromise = null;
  this.socket = null;
  this.subscriptions = {};
  this.url = url;
};

CollectionUpdater.prototype.start = function() {
  var _this = this;

  var promise = new Promise(function(resolve, reject) {
    if (_this._connection) {
      resolve();
    } else if (_this.connectPromise) {
      return _this.connectPromise.promise;
    } else {
      _this.connectPromise = {
        promise: promise,
        resolve: resolve,
        reject: reject
      };

      _this.socket = _this._openWebSocket(_this.url);
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

  this.connectPromise.resolve();
  this.connectPromise = null;
};

CollectionUpdater.prototype._onmessage = function(event) {
  var message = JSON.parse(event.data);

  _.each(this.subscriptions[message.path], function(collection) {
    collection.add(message.data, {at: 0, merge: true});
  });
};

CollectionUpdater.prototype._onclose = function() {
  if (this.connectPromise) {
    this.connectPromise.reject();
    this.connectPromise = null;
  }

  this._scheduleRestart();
};

CollectionUpdater.prototype._scheduleRestart = function() {
  console.warn(
    'No connection to ' + this.url +
    ', retrying in ' + RESTART_TIMEOUT + ' seconds.'
  );

  var _this = this;

  setTimeout(function () {
    _this.start().catch(_this._scheduleRestart.bind(_this));
  }, RESTART_TIMEOUT * 1000);
};

CollectionUpdater.prototype._send = function(payload) {
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    this.socket.send(JSON.stringify(payload));
  }
};
