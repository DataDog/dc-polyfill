#!/usr/bin/env node --expose-gc

'use strict';

// This test ensures that diagnostic channel references aren't leaked.

const test = require('tape');
const common = require('./common.js');
const { subscribe, unsubscribe } = require('../dc-polyfill.js');

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
