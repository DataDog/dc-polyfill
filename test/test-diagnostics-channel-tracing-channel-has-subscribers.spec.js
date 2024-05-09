'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-has-subscribers', (t) => {
  t.plan(10);

  const handler = common.mustNotCall();

  {
    const handlers = {
      start: common.mustNotCall()
    };

    const channel = dc.tracingChannel('test');

    t.strictEqual(channel.hasSubscribers, false);

    channel.subscribe(handlers);
    t.strictEqual(channel.hasSubscribers, true);

    channel.unsubscribe(handlers);
    t.strictEqual(channel.hasSubscribers, false);

    channel.start.subscribe(handler);
    t.strictEqual(channel.hasSubscribers, true);

    channel.start.unsubscribe(handler);
    t.strictEqual(channel.hasSubscribers, false);
  }

  {
    const handlers = {
      asyncEnd: common.mustNotCall()
    };

    const channel = dc.tracingChannel('test');

    t.strictEqual(channel.hasSubscribers, false);

    channel.subscribe(handlers);
    t.strictEqual(channel.hasSubscribers, true);

    channel.unsubscribe(handlers);
    t.strictEqual(channel.hasSubscribers, false);

    channel.asyncEnd.subscribe(handler);
    t.strictEqual(channel.hasSubscribers, true);

    channel.asyncEnd.unsubscribe(handler);
    t.strictEqual(channel.hasSubscribers, false);
  }
});
