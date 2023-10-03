const makeCall = (fn) => (...args) => fn.call(...args);

// https://github.com/tc39/proposal-relative-indexing-method#polyfill
function arrayAtPolyfill(n) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0;
  // Allow negative indexing from the end
  if (n < 0) n += this.length;
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= this.length) return undefined;
  // Otherwise, this is just normal property access
  return this[n];
}

const ReflectApply = Reflect.apply;
const PromiseReject = Promise.reject.bind(Promise);
const PromiseResolve = Promise.resolve;
const PromisePrototypeThen = makeCall(Promise.prototype.then);
const ArrayPrototypeSplice = makeCall(Array.prototype.splice);
const ArrayPrototypeAt = makeCall(Array.prototype.at || arrayAtPolyfill);

module.exports = {
  ReflectApply,
  PromiseReject,
  PromiseResolve,
  PromisePrototypeThen,
  ArrayPrototypeSplice,
  ArrayPrototypeAt,
};
