'use strict';

// This test ensures that diagnostic channel references aren't leaked.

const test = require('tape');
const { subscribe, unsubscribe } = require('../dc-polyfill.js');

const v8 = require('v8');
v8.setFlagsFromString('--expose-gc');
// https://github.com/nodejs/node/issues/16595#issuecomment-340288680
global.gc = require('vm').runInNewContext('gc');

test('test-diagnostics-channel-memory-leak', (t) => {
  t.plan(1);
  function noop() {}

  const heapUsedBefore = process.memoryUsage().heapUsed;

  for (let i = 0; i < 1000; i++) {
    subscribe(String(i), noop);
    unsubscribe(String(i), noop);
  }

  global.gc();

  const heapUsedAfter = process.memoryUsage().heapUsed;

  t.ok(heapUsedBefore >= heapUsedAfter);
});
