'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

const input = {
  foo: 'bar'
};

test('test-diagnostics-channel-object-channel-pub-sub', (t) => {
  t.plan(11);

  const { Channel } = dc;

  // Should not have named channel
  t.ok(!dc.hasSubscribers('test'));

  // Individual channel objects can be created to avoid future lookups
  const channel = dc.channel('test');
  t.ok(channel instanceof Channel);

  // No subscribers yet, should not publish
  t.ok(!channel.hasSubscribers);

  const subscriber = common.mustCall((message, name) => {
    t.strictEqual(name, channel.name);
    t.deepEqual(message, input);
  });

  // Now there's a subscriber, should publish
  channel.subscribe(subscriber);
  t.ok(channel.hasSubscribers);

  // The ActiveChannel prototype swap should not fail instanceof
  t.ok(channel instanceof Channel);

  // Should trigger the subscriber once
  channel.publish(input);

  // Should not publish after subscriber is unsubscribed
  t.ok(channel.unsubscribe(subscriber));
  t.ok(!channel.hasSubscribers);

  // unsubscribe() should return false when subscriber is not found
  t.ok(!channel.unsubscribe(subscriber));

  t.throws(() => {
    channel.subscribe(null);
  }, { code: 'ERR_INVALID_ARG_TYPE' });
});
