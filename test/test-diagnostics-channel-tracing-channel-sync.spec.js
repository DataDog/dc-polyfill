'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');

test('test-diagnostics-channel-tracing-channel-sync', (t) => {
  t.plan(12);

  const channel = dc.tracingChannel('test');

  const expectedResult = { foo: 'bar' };
  const input = { foo: 'bar' };
  const thisArg = { baz: 'buz' };
  const arg = { baz: 'buz' };

  function check(found) {
    t.strictEqual(found, input);
  }

  const handlers = {
    start: common.mustCall(check),
    end: common.mustCall((found) => {
      check(found);
      t.strictEqual(found.result, expectedResult);
    }),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustNotCall()
  };

  t.strictEqual(channel.start.hasSubscribers, false);
  channel.subscribe(handlers);
  t.strictEqual(channel.start.hasSubscribers, true);
  const result1 = channel.traceSync(function(arg1) {
    t.strictEqual(arg1, arg);
    t.strictEqual(this, thisArg);
    return expectedResult;
  }, input, thisArg, arg);
  t.strictEqual(result1, expectedResult);

  channel.unsubscribe(handlers);
  t.strictEqual(channel.start.hasSubscribers, false);
  const result2 = channel.traceSync(function(arg1) {
    t.strictEqual(arg1, arg);
    t.strictEqual(this, thisArg);
    return expectedResult;
  }, input, thisArg, arg);
  t.strictEqual(result2, expectedResult);
});
