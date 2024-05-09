'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-sync-early-exit', (t) => {
  t.plan(1);
  const channel = dc.tracingChannel('test');

  const handlers = {
    start: common.mustNotCall(),
    end: common.mustNotCall(),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  // While subscribe occurs _before_ the sync call ends,
  // no end event should be published.
  channel.traceSync(() => {
    channel.subscribe(handlers);
  }, {});

  t.ok(true);
});
