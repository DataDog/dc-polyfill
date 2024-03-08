'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-promise-early-exit', (t) => {
  t.plan(1);
  const channel = dc.tracingChannel('test');

  const handlers = {
    start: common.mustNotCall(),
    end: common.mustNotCall(),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  // While subscribe occurs _before_ the promise resolves,
  // no async events should be published.
  channel.tracePromise(() => {
    return new Promise(setImmediate);
  }, {});
  channel.subscribe(handlers);

  t.ok(true);
});
