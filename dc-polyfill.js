const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);

const ReflectApply = Reflect.apply;
const PromiseReject = Promise.reject;
const PromiseResolve = Promise.resolve;
const PromisePrototypeThen = Promise.prototype.then;
const ArrayPrototypeSplice = Array.prototype.splice;

const { ERR_INVALID_ARG_TYPE } = require('./errors.js');

if (hasFullSupport()) {
  module.exports = require('node:diagnostics_channel');
  return
}

// TODO: everything else

let dc;
let channel_registry;

if (providesDiagnosticsChannel()) {
  dc = require('diagnostics_channel');
}

if (!providesDiagnosticsChannel()) {
  // TODO
  channel_registry = Symbol.for('dc-polyfill');
  dc = require('./reimplementation.js');
}

if (!providesTopSubscribeUnsubscribe()) {
  dc.subscribe = (channel, cb) => {
    dc.channel(channel).subscribe(cb);
  };
  dc.unsubscribe = (channel, cb) => {
    if (dc.channel(channel).hasSubscribers) {
      dc.channel(channel).unsubscribe(cb);
    }
  };
}

if (!providesTracingChannel()) {
  dc.tracingChannel = tracingChannel;
}

module.exports = dc;

class TracingChannel {
  constructor(nameOrChannels) {
    if (typeof nameOrChannels === 'string') {
      this.start = channel(`tracing:${nameOrChannels}:start`);
      this.end = channel(`tracing:${nameOrChannels}:end`);
      this.asyncStart = channel(`tracing:${nameOrChannels}:asyncStart`);
      this.asyncEnd = channel(`tracing:${nameOrChannels}:asyncEnd`);
      this.error = channel(`tracing:${nameOrChannels}:error`);
    } else if (typeof nameOrChannels === 'object') {
      const { start, end, asyncStart, asyncEnd, error } = nameOrChannels;

      // assertChannel(start, 'nameOrChannels.start');
      // assertChannel(end, 'nameOrChannels.end');
      // assertChannel(asyncStart, 'nameOrChannels.asyncStart');
      // assertChannel(asyncEnd, 'nameOrChannels.asyncEnd');
      // assertChannel(error, 'nameOrChannels.error');

      this.start = start;
      this.end = end;
      this.asyncStart = asyncStart;
      this.asyncEnd = asyncEnd;
      this.error = error;
    } else {
      throw new ERR_INVALID_ARG_TYPE('nameOrChannels',
                                     ['string', 'object', 'Channel'],
                                     nameOrChannels);
    }
  }

  subscribe(handlers) {
    for (const name of traceEvents) {
      if (!handlers[name]) continue;

      if (this[name]) this[name].subscribe(handlers[name]);
    }
  }

  unsubscribe(handlers) {
    let done = true;

    for (const name of traceEvents) {
      if (!handlers[name]) continue;

      if (!this[name]?.unsubscribe(handlers[name])) { // TODO ?.
        done = false;
      }
    }

    return done;
  }

  traceSync(fn, context = {}, thisArg, ...args) {
    const { start, end, error } = this;

    return start.runStores(context, () => {
      try {
        const result = ReflectApply(fn, thisArg, args);
        context.result = result;
        return result;
      } catch (err) {
        context.error = err;
        error.publish(context);
        throw err;
      } finally {
        end.publish(context);
      }
    });
  }

  tracePromise(fn, context = {}, thisArg, ...args) {
    const { start, end, asyncStart, asyncEnd, error } = this;

    function reject(err) {
      context.error = err;
      error.publish(context);
      asyncStart.publish(context);
      // TODO: Is there a way to have asyncEnd _after_ the continuation?
      asyncEnd.publish(context);
      return PromiseReject(err);
    }

    function resolve(result) {
      context.result = result;
      asyncStart.publish(context);
      // TODO: Is there a way to have asyncEnd _after_ the continuation?
      asyncEnd.publish(context);
      return result;
    }

    return start.runStores(context, () => {
      try {
        let promise = ReflectApply(fn, thisArg, args);
        // Convert thenables to native promises
        if (!(promise instanceof Promise)) {
          promise = PromiseResolve(promise);
        }
        return PromisePrototypeThen(promise, resolve, reject);
      } catch (err) {
        context.error = err;
        error.publish(context);
        throw err;
      } finally {
        end.publish(context);
      }
    });
  }

  traceCallback(fn, position = -1, context = {}, thisArg, ...args) {
    const { start, end, asyncStart, asyncEnd, error } = this;

    function wrappedCallback(err, res) {
      if (err) {
        context.error = err;
        error.publish(context);
      } else {
        context.result = res;
      }

      // Using runStores here enables manual context failure recovery
      asyncStart.runStores(context, () => {
        try {
          if (callback) {
            return ReflectApply(callback, this, arguments);
          }
        } finally {
          asyncEnd.publish(context);
        }
      });
    }

    const callback = ArrayPrototypeAt(args, position);
    if (typeof callback !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('callback', ['function'], callback);
    }
    ArrayPrototypeSplice(args, position, 1, wrappedCallback);

    return start.runStores(context, () => {
      try {
        return ReflectApply(fn, thisArg, args);
      } catch (err) {
        context.error = err;
        error.publish(context);
        throw err;
      } finally {
        end.publish(context);
      }
    });
  }
}

function tracingChannel(nameOrChannels) {
  return new TracingChannel(nameOrChannels);
}



function hasFullSupport() {
  return MAJOR >= 20;
}

function providesTracingChannel() {
  return hasFullSupport();
}

function providesTopSubscribeUnsubscribe() {
  return hasFullSupport()
    || (MAJOR === 16 && MINOR >= 17)
    || (MAJOR === 18 && MINOR >= 7);
}

function providesDiagnosticsChannel() {
  return providesTopSubscribeUnsubscribe()
    || (MAJOR >= 16)
    || (MAJOR === 15 && MINOR >= 1)
    || (MAJOR === 14 && MINOR >= 17);
}

function hasGarbageCollectionBug() {
  return providesDiagnosticsChannel()
    && !hasFullSupport()
}
