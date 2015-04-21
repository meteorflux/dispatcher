/**

A Flux Dispatcher for Meteor, based on the Facebook's Flux Dispatcher:
https://github.com/facebook/flux

The MIT License (MIT)

Copyright (c) 2015 Luis Herranz <luisherranz@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**/

MeteorFlux = {};
var _lastID = 1;
var _prefix = 'ID_';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */
var invariant = function(condition, error_message, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if ((format === undefined)||(error_message === undefined)) {
      error = new Meteor.Error(
        'minified-exception',
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Meteor.Error(
        error_message,
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }
    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

/**
* MeteorFlux.Dispatcher is used to broadcast payloads to registered callbacks.
*/

MeteorFlux.Dispatcher = function(){
  this._callbacks = {};
  this._isPending = {};
  this._isHandled = {};
  this._isDispatching = false;
  this._pendingPayload = null;
};


/**
* Registers a callback to be invoked with every dispatched payload. Returns
* a token that can be used with `waitFor()`.
*
* @param {function} callback
* @return {string}
*/
MeteorFlux.Dispatcher.prototype.register = function(callback) {
  var id = _prefix + _lastID++;
  this._callbacks[id] = callback;
  return id;
};

/**
* Removes a callback based on its token.
*
* @param {string} id
*/
MeteorFlux.Dispatcher.prototype.unregister = function(id) {
  invariant(
    this._callbacks[id],
    'dispatcher-unregister-not-map',
    'MeteorFlux.Dispatcher.unregister(...): `%s` does not map to a registered callback.',
    id
  );
  delete this._callbacks[id];
};

/**
* Waits for the callbacks specified to be invoked before continuing execution
* of the current callback. This method should only be used by a callback in
* response to a dispatched payload.
*
* @param {array<string>} ids
*/
MeteorFlux.Dispatcher.prototype.waitFor = function(ids) {
  invariant(
    this._isDispatching,
    'dispatcher-waitfor-invoked-outside-dispatch',
    'MeteorFlux.Dispatcher.waitFor(...): Must be invoked while dispatching.'
  );
  for (var ii = 0; ii < ids.length; ii++) {
    var id = ids[ii];
    if (this._isPending[id]) {
      invariant(
        this._isHandled[id],
        'dispatcher-waitfor-circular-dependency',
        'MeteorFlux.Dispatcher.waitFor(...): Circular dependency detected while ' +
        'waiting for `%s`.',
        id
      );
      continue;
    }
    invariant(
      this._callbacks[id],
      'dispatcher-waitfor-invalid-token',
      'MeteorFlux.Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
      id
    );
    this._invokeCallback(id);
  }
};

/**
* Dispatches a payload to all registered callbacks.
*
* @param {object} payload
*/
MeteorFlux.Dispatcher.prototype.dispatch = function(payload) {
  invariant(
    !this._isDispatching,
    'dispatcher-cant-dispatch-while-dispatching',
    'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
  );
  this._startDispatching(payload);
  try {
    for (var id in this._callbacks) {
      if (this._isPending[id]) {
        continue;
      }
      this._invokeCallback(id);
    }
  } finally {
    this._stopDispatching();
  }
};

/**
* Is this MeteorFlux.Dispatcher currently dispatching.
*
* @return {boolean}
*/
MeteorFlux.Dispatcher.prototype.isDispatching = function() {
  return this._isDispatching;
};

/**
* Call the callback stored with the given id. Also do some internal
* bookkeeping.
*
* @param {string} id
* @internal
*/
MeteorFlux.Dispatcher.prototype._invokeCallback = function(id) {
  this._isPending[id] = true;
  this._callbacks[id](this._pendingPayload);
  this._isHandled[id] = true;
};

/**
* Set up bookkeeping needed when dispatching.
*
* @param {object} payload
* @internal
*/
MeteorFlux.Dispatcher.prototype._startDispatching = function(payload) {
  for (var id in this._callbacks) {
    this._isPending[id] = false;
    this._isHandled[id] = false;
  }
  this._pendingPayload = payload;
  this._isDispatching = true;
};

/**
* Clear bookkeeping used for dispatching.
*
* @internal
*/
MeteorFlux.Dispatcher.prototype._stopDispatching = function() {
  this._pendingPayload = null;
  this._isDispatching = false;
};


/**
* Reset everything. Created for testing purposes
*
*/
MeteorFlux.Dispatcher.prototype.reset = function() {
  this._callbacks = {};
  this._isPending = {};
  this._isHandled = {};
  this._isDispatching = false;
  this._pendingPayload = null;
};

/**
* The main Dispatcher instance that clients will deal with
*
* @exports Dispatcher
*/

Dispatcher = new MeteorFlux.Dispatcher();
