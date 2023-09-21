'use strict';

require('./common.js');

const assert = require('assert');
const test = require('tape');

const { channel, hasSubscribers } = require('../dc-polyfill.js');

test('test-diagnostics-channel-has-subscribers', t => {
  const dc = channel('test-diagnostics-channel-has-subscribers');
  t.ok(!hasSubscribers('test-diagnostics-channel-has-subscribers'));

  dc.subscribe(() => {});
  t.ok(hasSubscribers('test-diagnostics-channel-has-subscribers'));
  t.end();
});
