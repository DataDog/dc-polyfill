'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

test('test-diagnostics-channel-tracing-channel-sync-error', (t) => {
  t.plan(7);

  const channel = dc.tracingChannel('test');

  const expectedError = new Error('test');
  const input = { foo: 'bar' };
  const thisArg = { baz: 'buz' };

  function check(found) {
    t.deepEqual(found, input);
  }

  const handlers = {
    start: common.mustCall(check),
    end: common.mustCall(check),
    asyncStart: common.mustNotCall(),
    asyncEnd: common.mustNotCall(),
    error: common.mustCall((found) => {
      check(found);
      t.deepEqual(found.error, expectedError);
    })
  };

  channel.subscribe(handlers);
  try {
    channel.traceSync(function(err) {
      t.deepEqual(this, thisArg);
      t.strictEqual(err, expectedError);
      throw err;
    }, input, thisArg, expectedError);

    throw new Error('It should not reach this error');
  } catch (error) {
    t.deepEqual(error, expectedError);
  }
});
