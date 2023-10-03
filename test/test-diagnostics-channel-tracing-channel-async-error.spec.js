'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');
const assert = require('assert');

test('test-diagnostics-channel-tracing-channel-async-error', (t) => {
  t.plan(17);

  const channel = dc.tracingChannel('test');

  const expectedError = new Error('test');
  const input = { foo: 'bar' };
  const thisArg = { baz: 'buz' };

  function check(found) {
    t.deepEqual(found, input);
  }

  const handlers = {
    start: common.mustCall(check, 2),
    end: common.mustCall(check, 2),
    asyncStart: common.mustCall(check, 2),
    asyncEnd: common.mustCall(check, 2),
    error: common.mustCall((found) => {
      check(found);
      t.deepEqual(found.error, expectedError);
    }, 2)
  };

  channel.subscribe(handlers);

  channel.traceCallback(function(cb, err) {
    t.deepEqual(this, thisArg);
    setImmediate(cb, err);
  }, 0, input, thisArg, common.mustCall((err, res) => {
    t.strictEqual(err, expectedError);
    t.strictEqual(res, undefined);
  }), expectedError);

  channel.tracePromise(function(value) {
    t.deepEqual(this, thisArg);
    return Promise.reject(value);
  }, input, thisArg, expectedError).then(
    common.mustNotCall(),
    common.mustCall((value) => {
      t.deepEqual(value, expectedError);
    })
  );
});
