const {
  ReflectApply,
  FunctionPrototypeCallApply,
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
      protoTrCh.traceSync = function (fn, context, thisArg, a, b, c) {
        const argc = arguments.length;
        if (!this.hasSubscribers) {
          if (argc <= 3) return FunctionPrototypeCallApply(fn, thisArg);
          if (argc === 4) return FunctionPrototypeCallApply(fn, thisArg, a);
          if (argc === 5) return FunctionPrototypeCallApply(fn, thisArg, a, b);
          if (argc === 6) return FunctionPrototypeCallApply(fn, thisArg, a, b, c);
          return ReflectApply(fn, thisArg, sliceFrom(arguments, 3));
        }
        if (argc <= 3) return FunctionPrototypeCallApply(origTraceSync, this, fn, context, thisArg);
        if (argc === 4) return FunctionPrototypeCallApply(origTraceSync, this, fn, context, thisArg, a);
        if (argc === 5) return FunctionPrototypeCallApply(origTraceSync, this, fn, context, thisArg, a, b);
        if (argc === 6) return FunctionPrototypeCallApply(origTraceSync, this, fn, context, thisArg, a, b, c);
        return ReflectApply(origTraceSync, this, sliceFrom(arguments, 0));
      };
    }

    const origTracePromise = protoTrCh.tracePromise;
    if (typeof origTracePromise === 'function') {
      protoTrCh.tracePromise = function (fn, context, thisArg, a, b, c) {
        const argc = arguments.length;
        if (!this.hasSubscribers) {
          if (argc <= 3) return FunctionPrototypeCallApply(fn, thisArg);
          if (argc === 4) return FunctionPrototypeCallApply(fn, thisArg, a);
          if (argc === 5) return FunctionPrototypeCallApply(fn, thisArg, a, b);
          if (argc === 6) return FunctionPrototypeCallApply(fn, thisArg, a, b, c);
          return ReflectApply(fn, thisArg, sliceFrom(arguments, 3));
        }
        if (argc <= 3) return FunctionPrototypeCallApply(origTracePromise, this, fn, context, thisArg);
        if (argc === 4) return FunctionPrototypeCallApply(origTracePromise, this, fn, context, thisArg, a);
        if (argc === 5) return FunctionPrototypeCallApply(origTracePromise, this, fn, context, thisArg, a, b);
        if (argc === 6) return FunctionPrototypeCallApply(origTracePromise, this, fn, context, thisArg, a, b, c);
        return ReflectApply(origTracePromise, this, sliceFrom(arguments, 0));
      };
    }

    const origTraceCallback = protoTrCh.traceCallback;
    if (typeof origTraceCallback === 'function') {
      protoTrCh.traceCallback = function (fn, position, context, thisArg, a, b, c) {
        const argc = arguments.length;
        if (!this.hasSubscribers) {
          if (argc <= 4) return FunctionPrototypeCallApply(fn, thisArg);
          if (argc === 5) return FunctionPrototypeCallApply(fn, thisArg, a);
          if (argc === 6) return FunctionPrototypeCallApply(fn, thisArg, a, b);
          if (argc === 7) return FunctionPrototypeCallApply(fn, thisArg, a, b, c);
          return ReflectApply(fn, thisArg, sliceFrom(arguments, 4));
        }
        if (argc <= 4) return FunctionPrototypeCallApply(origTraceCallback, this, fn, position, context, thisArg);
        if (argc === 5) return FunctionPrototypeCallApply(origTraceCallback, this, fn, position, context, thisArg, a);
        if (argc === 6) return FunctionPrototypeCallApply(origTraceCallback, this, fn, position, context, thisArg, a, b);
        if (argc === 7) return FunctionPrototypeCallApply(origTraceCallback, this, fn, position, context, thisArg, a, b, c);
        return ReflectApply(origTraceCallback, this, sliceFrom(arguments, 0));
      };
    }
  }

  return dc;
};

function sliceFrom(argsLike, from) {
  const len = argsLike.length;
  const out = new Array(len - from);
  for (let i = from; i < len; i++) out[i - from] = argsLike[i];
  return out;
}
