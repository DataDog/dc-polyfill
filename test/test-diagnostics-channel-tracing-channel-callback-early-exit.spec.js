'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-callback-early-exit', (t) => {
  t.plan(1);
  const channel = dc.tracingChannel('test');

  const handlers = {
    start: common.mustNotCall(),
    end: common.mustNotCall(),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  // While subscribe occurs _before_ the callback executes,
  // no async events should be published.
  channel.traceCallback(setImmediate, 0, {}, null, common.mustCall());
  channel.subscribe(handlers);

  t.ok(true);
});
