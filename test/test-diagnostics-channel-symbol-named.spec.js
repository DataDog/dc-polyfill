'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

const input = {
  foo: 'bar'
};

const symbol = Symbol('test');

test('test-diagnostics-channel-http', (t) => {
  t.plan(3);
  // Individual channel objects can be created to avoid future lookups
  const channel = dc.channel(symbol);

  // Expect two successful publishes later
  channel.subscribe(common.mustCall((message, name) => {
    t.strictEqual(name, symbol);
    t.deepEqual(message, input);
  }));

  channel.publish(input);

  {
    t.throws(() => {
      dc.channel(null);
    }, /ERR_INVALID_ARG_TYPE/);
  }
});
