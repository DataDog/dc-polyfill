const test = require('tape');
const dc = require('../dc-polyfill.js');
const checks = require('../checks.js');

test('high level checks', t => {
  t.ok(dc.subscribe, 'provides a top level .subscribe method');
  t.equal(typeof dc.subscribe, 'function', 'top level .subscribe is a function');
  t.ok(dc.unsubscribe, 'provides a top level .unsubscribe method');
  t.equal(typeof dc.unsubscribe, 'function', 'top level .unsubscribe is a function');
  t.ok(dc.channel, 'provides a top level .channel method');
  t.equal(typeof dc.channel, 'function', 'top level .channel is a function');
  t.ok(dc.hasSubscribers, 'provides a top level .hasSubscribers method');
  t.equal(typeof dc.hasSubscribers, 'function', 'top level .hasSubscribers is a function');
  t.ok(dc.tracingChannel, 'provides a top level .tracingChannel method');
  t.equal(typeof dc.tracingChannel, 'function', 'top level .tracingChannel is a function');
  t.ok(dc.Channel, 'provides a top level .Channel class');
  t.equal(typeof dc.Channel, 'function', 'top level .Channel is a function');
  t.end();
});

test('channel tests', t => {
  const ch = dc.channel('foo');
  t.ok(ch instanceof dc.Channel, 'dc.channel() return value instance of dc.Channel');
  t.strictEqual(dc.channel('foo'), dc.channel('foo'), 'multiple calls to dc.channel() return same channel instance');
  t.notEqual(dc.channel('foo'), dc.channel('bar'), 'calls to dc.channel() with different names return separate channel instances');
  t.equal(typeof dc.channel('foo1').bindStore, 'function', 'provides Channel#bindStore()');
  t.equal(typeof dc.channel('foo2').unbindStore, 'function', 'provides Channel#unbindStore()');
  t.equal(typeof dc.channel('foo3').runStores, 'function', 'provides Channel#runStores()');
  t.end();
});

test('ch.hasSubscribers', t => {
  const ch = dc.channel('nessie');
  t.equal(ch.hasSubscribers, false, 'newly created channel should have no subscribers');
  // Can't check constructor as garbage collection patch makes all channels an ActiveChannel...
  // t.equal(ch.constructor.name, 'Channel', 'by default is an instance of Channel');

  const fn = function MY_SUB() {};
  dc.subscribe('nessie', fn);
  t.equal(ch.hasSubscribers, true, 'once a subscription occures then hasSubscribers is truthy');
  // Can't check constructor as garbage collection patch makes all channels an ActiveChannel...
  // t.equal(ch.constructor.name, 'ActiveChannel', 'once it gets subscribers it is an ActiveChannel instance');

  dc.unsubscribe('nessie', fn);
  t.equal(ch.hasSubscribers, false, 'once everyone has unsubscribed then hasSubscribers is falsey');
  // Can't check constructor as garbage collection patch makes all channels an ActiveChannel...
  // t.equal(ch.constructor.name, 'Channel', 'once the final subscriber leaves the instance is of Channel again');

  t.end();
});
