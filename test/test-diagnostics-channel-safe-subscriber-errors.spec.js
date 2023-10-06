'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');

const input = {
  foo: 'bar'
};

test('test-diagnostics-channel-http', (t) => {
  t.plan(1);
  const channel = dc.channel('fail');

  const error = new Error('nope');

  process.on('uncaughtException', common.mustCall((err) => {
    t.strictEqual(err, error);
  }));

  channel.subscribe(common.mustCall((message, name) => {
    throw error;
  }));

  // The failing subscriber should not stop subsequent subscribers from running
  channel.subscribe(common.mustCall());

  // Publish should continue without throwing
  const fn = common.mustCall();
  channel.publish(input);
  fn();
});
