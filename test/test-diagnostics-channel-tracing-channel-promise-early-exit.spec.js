'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-promise-early-exit', (t) => {
  const channel = dc.tracingChannel('test-early-exit-promise');

  const handlers = {
    start: common.mustNotCall(),
    end: common.mustNotCall(),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  const expected = { ok: true };

  // Subscribe inside the traced fn — by then the early exit has already
  // committed, so no events should be published for this call.
  const result = channel.tracePromise(() => {
    channel.subscribe(handlers);
    return Promise.resolve(expected);
  }, {});

  result.then((value) => {
    t.strictEqual(value, expected);
    channel.unsubscribe(handlers);
    t.end();
  }, (err) => {
    t.fail(err);
    t.end();
  });
});
