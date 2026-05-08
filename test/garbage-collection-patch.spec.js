const test = require('tape');
const patch = require('../patch-garbage-collection-bug.js');

// Simulate the Node 18 bug: the underlying channel(name) returns a
// brand-new Channel object on every call for the same name, even when
// the previous one is still held alive by JS code. The patch's job is
// to make dc.channel(name) return a stable Channel identity per name
// regardless of what the underlying registry returns.
function mockUnpatched() {
  const calls = { count: 0 };
  function channel(name) {
    calls.count++;
    return {
      _subscribers: [],
      _stores: new Map(),
      _name: name,
      _instanceId: calls.count,
      subscribe(fn) { this._subscribers.push(fn); },
      unsubscribe(fn) {
        const i = this._subscribers.indexOf(fn);
        if (i >= 0) this._subscribers.splice(i, 1);
        return i >= 0;
      },
      publish(data) {
        for (const sub of this._subscribers) sub(data);
      }
    };
  }
  return { channel, calls };
}

test('garbage-collection patch: dc.channel(name) returns stable identity across calls', t => {
  const { channel, calls } = mockUnpatched();
  const dc = patch({ channel });

  const a = dc.channel('foo');
  const b = dc.channel('foo');
  const c = dc.channel('foo');

  t.strictEqual(a, b, 'second call to dc.channel(name) returns same Channel object');
  t.strictEqual(b, c, 'third call returns same Channel object');
  t.ok(calls.count >= 1, 'underlying channel() was called at least once for first lookup');

  const callsAfterMemoization = calls.count;
  dc.channel('foo');
  dc.channel('foo');
  t.equal(calls.count, callsAfterMemoization,
    'memoized lookups do not re-invoke the underlying channel()');

  t.end();
});

test('garbage-collection patch: distinct names get distinct Channel objects', t => {
  const { channel } = mockUnpatched();
  const dc = patch({ channel });

  const foo = dc.channel('foo');
  const bar = dc.channel('bar');

  t.notStrictEqual(foo, bar, 'different names return different Channel objects');
  t.strictEqual(dc.channel('foo'), foo, 'foo memoization holds');
  t.strictEqual(dc.channel('bar'), bar, 'bar memoization holds');
  t.end();
});

test('garbage-collection patch: subscribers attach to the memoized Channel and receive publishes', t => {
  // This is the end-to-end shape the bug produces: the publisher captures
  // a Channel from one call, the subscriber attaches via a later call.
  // Without memoization (when the underlying channel() misbehaves) the
  // two see different Channel objects and the subscriber never fires.
  const { channel } = mockUnpatched();
  const dc = patch({ channel });

  const publisher = dc.channel('observable');

  let received = null;
  dc.channel('observable').subscribe((data) => { received = data; });

  publisher.publish('hello');

  t.equal(received, 'hello', 'subscriber attached to a later dc.channel(name) lookup receives publishes from the earlier-captured Channel');
  t.end();
});
