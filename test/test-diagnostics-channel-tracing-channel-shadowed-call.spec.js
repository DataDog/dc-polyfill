'use strict';

// Regression: trace*() must not dispatch through user-controlled fn.call.
// A function with `f.call = null` would crash a `fn.call(...)` based wrapper
// but native and the polyfill use Reflect.apply / primordials.

const test = require('tape');
const dc = require('../dc-polyfill.js');

test('traceSync survives shadowed fn.call when no subscribers', (t) => {
  const channel = dc.tracingChannel('test-shadowed-call-sync');
  const fn = function () { return 42; };
  fn.call = null;
  t.strictEqual(channel.traceSync(fn, {}, null), 42);
  t.end();
});

test('tracePromise survives shadowed fn.call when no subscribers', (t) => {
  const channel = dc.tracingChannel('test-shadowed-call-promise');
  const expected = Promise.resolve(42);
  const fn = function () { return expected; };
  fn.call = null;
  const result = channel.tracePromise(fn, {}, null);
  t.strictEqual(result, expected);
  t.end();
});

test('traceCallback survives shadowed fn.call when no subscribers', (t) => {
  const channel = dc.tracingChannel('test-shadowed-call-callback');
  const fn = function (cb) { cb(null, 42); };
  fn.call = null;
  channel.traceCallback(fn, -1, {}, null, (err, value) => {
    t.error(err);
    t.strictEqual(value, 42);
    t.end();
  });
});
