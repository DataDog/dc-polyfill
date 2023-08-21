const assert = require('assert');

const dc = require('../dc-polyfill.js');

{
  assert.ok(dc.subscribe, 'provides a top level .subscribe method');
  assert.equal(typeof dc.subscribe, 'function', 'top level .subscribe is a function');
}

{
  assert.ok(dc.unsubscribe, 'provides a top level .unsubscribe method');
  assert.equal(typeof dc.unsubscribe, 'function', 'top level .unsubscribe is a function');
}

{
  assert.ok(dc.channel, 'provides a top level .channel method');
  assert.equal(typeof dc.channel, 'function', 'top level .channel is a function');
}

{
  assert.ok(dc.hasSubscribers, 'provides a top level .hasSubscribers method');
  assert.equal(typeof dc.hasSubscribers, 'function', 'top level .hasSubscribers is a function');
}

{
  assert.ok(dc.tracingChannel, 'provides a top level .tracingChannel method');
  assert.equal(typeof dc.tracingChannel, 'function', 'top level .tracingChannel is a function');
}

{
  assert.ok(dc.Channel, 'provides a top level .Channel class');
  assert.equal(typeof dc.Channel, 'function', 'top level .Channel is a function');
}

{
  const ch = dc.channel('foo');
  assert.ok(ch instanceof dc.Channel, 'dc.channel() return value instance of dc.Channel');
}

{
  assert.strictEqual(dc.channel('foo'), dc.channel('foo'), 'multiple calls to dc.channel() return same channel instance');
  assert.notEqual(dc.channel('foo'), dc.channel('bar'), 'calls to dc.channel() with different names return separate channel instances');
}

{
  const ch = dc.channel('nessie');

  assert.equal(ch.hasSubscribers, false, 'newly created channel should have no subscribers');

  const fn = () => {};

  dc.subscribe('nessie', fn);

  assert.equal(ch.hasSubscribers, true, 'once a subscription occures then hasSubscribers is truthy');

  dc.unsubscribe('nessie', fn);

  assert.equal(ch.hasSubscribers, false, 'once an everyone has unsubscribed then hasSubscribers is falsey');
}

console.log(__filename, 'ok');
