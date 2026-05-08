'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-callback-early-exit', (t) => {
  const channel = dc.tracingChannel('test-early-exit-callback');

  const handlers = {
    start: common.mustNotCall(),
    end: common.mustNotCall(),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  const expected = { ok: true };

  function fn(arg, cb) {
    // Subscribe inside the traced fn — early exit has committed already,
    // so no events should be published for this call.
    channel.subscribe(handlers);
    process.nextTick(cb, null, arg);
  }

  channel.traceCallback(fn, -1, {}, null, expected, (err, value) => {
    t.error(err);
    t.strictEqual(value, expected);
    channel.unsubscribe(handlers);
    t.end();
  });
});
