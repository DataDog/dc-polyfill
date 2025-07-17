'use strict';

const test = require('tape');

const { channel, hasSubscribers } = require('../dc-polyfill.js');

const { MAJOR, MINOR } = require('../checks.js');

test('test-diagnostics-channel-has-subscribers', t => {
  if (MAJOR === 15 && MINOR === 1) {
    // node:diagnostics_channel:110
    // if (ref) channel = WeakRefPrototypeGet(ref);
    // TypeError: WeakRefPrototypeGet is not a function
    t.comment('SKIPPING TEST DUE TO A BUG IN THIS VERSION OF NODE.JS');
    t.end();
    return;
  }

  const dc = channel('test-diagnostics-channel-has-subscribers');
  t.ok(!hasSubscribers('test-diagnostics-channel-has-subscribers'));

  dc.subscribe(() => {});
  t.ok(hasSubscribers('test-diagnostics-channel-has-subscribers'));
  t.end();
});
