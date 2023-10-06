'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const { MAJOR, MINOR } = require('../checks.js');

test('test-diagnostics-channel-tracing-channel-async', (t) => {
  t.plan(23);
  const channel = dc.tracingChannel('test');

  const expectedResult = { foo: 'bar' };
  const input = { foo: 'bar' };
  const thisArg = { baz: 'buz' };

  function check(found) {
    t.deepEqual(found, input);
  }

  const handlers = {
    start: common.mustCall(check, 2),
    end: common.mustCall(check, 2),
    asyncStart: common.mustCall((found) => {
      check(found);
      t.strictEqual(found.error, undefined);
      t.deepEqual(found.result, expectedResult);
    }, 2),
    asyncEnd: common.mustCall((found) => {
      check(found);
      t.strictEqual(found.error, undefined);
      t.deepEqual(found.result, expectedResult);
    }, 2),
    error: common.mustNotCall()
  };

  channel.subscribe(handlers);

  channel.traceCallback(function(cb, err, res) {
    t.deepEqual(this, thisArg);
    setImmediate(cb, err, res);
  }, 0, input, thisArg, common.mustCall((err, res) => {
    t.strictEqual(err, null);
    t.deepEqual(res, expectedResult);
  }), null, expectedResult);

  channel.tracePromise(function(value) {
    t.deepEqual(this, thisArg);
    return Promise.resolve(value);
  }, input, thisArg, expectedResult).then(
    common.mustCall((value) => {
      t.deepEqual(value, expectedResult);
    }),
    common.mustNotCall()
  );

  let failed = false;
  try {
    channel.traceCallback(common.mustNotCall(), 0, input, thisArg, 1, 2, 3);
  } catch (err) {
    if (MAJOR >= 20 && MINOR >= 6) {
      // By default, this error message is used for all of v20
      // However, patch-sync-unsubscribe-bug causes the error to change to the older version mentioning Array
      t.ok(/"callback" argument must be of type function/.test(err.message));
    } else {
      t.ok(/Received an instance of Array/.test(err.message));
    }
    failed = true;
  }
  t.strictEqual(failed, true);
});
