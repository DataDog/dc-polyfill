const {
  ArrayPrototypeAt,
  ArrayPrototypeSplice,
  ObjectDefineProperty,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  ReflectApply,
} = require('./primordials.js');

const { ERR_INVALID_ARG_TYPE } = require('./errors.js');

const traceEvents = [
  'start',
  'end',
  'asyncStart',
  'asyncEnd',
  'error',
];

function validateFunction(func, name) {
  if (typeof func !== 'function') {
    throw new ERR_INVALID_ARG_TYPE(name, ['function'], func);
  }
}

function assertChannel(value, name) {
  if (!(value instanceof Channel)) {
    throw new ERR_INVALID_ARG_TYPE(name, ['Channel'], value);
  }
}

module.exports = function (unpatched) {
  const { channel } = unpatched;

  const dc = { ...unpatched };

  function tracingChannelFrom(nameOrChannels, name) {
    if (typeof nameOrChannels === 'string') {
      return channel(`tracing:${nameOrChannels}:${name}`);
    }

    if (typeof nameOrChannels === 'object' && nameOrChannels !== null) {
      const channel = nameOrChannels[name];
      assertChannel(channel, `nameOrChannels.${name}`);
      return channel;
    }

    throw new ERR_INVALID_ARG_TYPE('nameOrChannels',
                                   ['string', 'object', 'TracingChannel'],
                                   nameOrChannels);
  }

  class TracingChannel {
    constructor(nameOrChannels) {
      for (const eventName of traceEvents) {
        ObjectDefineProperty(this, eventName, {
          __proto__: null,
          value: tracingChannelFrom(nameOrChannels, eventName),
        });
      }
    }

    get hasSubscribers() {
      return this.start.hasSubscribers ||
        this.end.hasSubscribers ||
        this.asyncStart.hasSubscribers ||
        this.asyncEnd.hasSubscribers ||
        this.error.hasSubscribers;
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

        if (!(this[name] && this[name].unsubscribe(handlers[name]))) {
          done = false;
        }
      }

      return done;
    }

    traceSync(fn, context = {}, thisArg, ...args) {
      if (!this.hasSubscribers) {
        return ReflectApply(fn, thisArg, args);
      }

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
      if (!this.hasSubscribers) {
        return ReflectApply(fn, thisArg, args);
      }

      const { start, end, asyncStart, asyncEnd, error } = this;

      function reject(err) {
        context.error = err;
        error.publish(context);
        asyncStart.publish(context);

        asyncEnd.publish(context);
        return PromiseReject(err);
      }

      function resolve(result) {
        context.result = result;
        asyncStart.publish(context);

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
      if (!this.hasSubscribers) {
        return ReflectApply(fn, thisArg, args);
      }

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
      validateFunction(callback, 'callback');
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

  dc.tracingChannel = tracingChannel;

  return dc;
};
