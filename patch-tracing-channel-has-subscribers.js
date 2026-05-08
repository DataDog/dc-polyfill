const {
  ReflectApply,
  ObjectDefineProperty,
  ObjectGetPrototypeOf,
} = require('./primordials.js');

module.exports = function (unpatched) {
  const dc = { ...unpatched };

  {
    const fauxTrCh = dc.tracingChannel('dc-polyfill-faux');

    const protoTrCh = ObjectGetPrototypeOf(fauxTrCh);

    ObjectDefineProperty(protoTrCh, 'hasSubscribers', {
      get: function () {
        return this.start.hasSubscribers
          || this.end.hasSubscribers
          || this.asyncStart.hasSubscribers
          || this.asyncEnd.hasSubscribers
          || this.error.hasSubscribers;
      },
      configurable: true
    });

    // Match native Node.js >= 22 / >= 20.13 behavior: when no channel has
    // subscribers, skip the entire tracing path and invoke fn directly.
    // Per native semantics, this intentionally bypasses traceCallback's
    // callback validation and tracePromise's thenable coercion.
    // @see https://github.com/nodejs/node/pull/51915
    const origTraceSync = protoTrCh.traceSync;
    if (typeof origTraceSync === 'function') {
      protoTrCh.traceSync = function (fn, context, thisArg, ...args) {
        if (!this.hasSubscribers) return ReflectApply(fn, thisArg, args);
        return ReflectApply(origTraceSync, this, [fn, context, thisArg, ...args]);
      };
    }

    const origTracePromise = protoTrCh.tracePromise;
    if (typeof origTracePromise === 'function') {
      protoTrCh.tracePromise = function (fn, context, thisArg, ...args) {
        if (!this.hasSubscribers) return ReflectApply(fn, thisArg, args);
        return ReflectApply(origTracePromise, this, [fn, context, thisArg, ...args]);
      };
    }

    const origTraceCallback = protoTrCh.traceCallback;
    if (typeof origTraceCallback === 'function') {
      protoTrCh.traceCallback = function (fn, position, context, thisArg, ...args) {
        if (!this.hasSubscribers) return ReflectApply(fn, thisArg, args);
        return ReflectApply(origTraceCallback, this, [fn, position, context, thisArg, ...args]);
      };
    }
  }

  return dc;
};
