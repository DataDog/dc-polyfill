const test = require('tape');
const patch = require('../patch-tracing-channel-stable-identity.js');

// Simulate the failure mode this patch addresses: native tracingChannel
// returns a fresh TracingChannel object on every string-form call (because
// Node's underlying channel() registry returned different sub-channel
// objects). The patch's job is to memoize TracingChannel objects by name
// so callers see a stable identity per name.
function mockUnpatched() {
  const calls = { count: 0 };
  function tracingChannel(nameOrChannels) {
    calls.count++;
    if (typeof nameOrChannels === 'string') {
      // Mimic the native behavior of building fresh sub-channels per call,
      // each with their own identity.
      return {
        _name: nameOrChannels,
        _instanceId: calls.count,
        start: { _name: `${nameOrChannels}:start`, _instanceId: calls.count },
        end: { _name: `${nameOrChannels}:end`, _instanceId: calls.count },
        asyncStart: { _name: `${nameOrChannels}:asyncStart`, _instanceId: calls.count },
        asyncEnd: { _name: `${nameOrChannels}:asyncEnd`, _instanceId: calls.count },
        error: { _name: `${nameOrChannels}:error`, _instanceId: calls.count },
      };
    }
    return { _passthrough: true, channels: nameOrChannels };
  }
  return { tracingChannel, calls };
}

test('tracing-channel stable-identity patch: tracingChannel(name) returns same TracingChannel across calls', t => {
  const { tracingChannel, calls } = mockUnpatched();
  const dc = patch({ tracingChannel });

  const a = dc.tracingChannel('foo');
  const b = dc.tracingChannel('foo');
  const c = dc.tracingChannel('foo');

  t.strictEqual(a, b, 'second call returns same TracingChannel');
  t.strictEqual(b, c, 'third call returns same TracingChannel');
  t.strictEqual(a.start, b.start, 'sub-channel start identity stable');
  t.strictEqual(a.end, b.end, 'sub-channel end identity stable');
  t.strictEqual(a.asyncStart, b.asyncStart, 'sub-channel asyncStart identity stable');
  t.strictEqual(a.asyncEnd, b.asyncEnd, 'sub-channel asyncEnd identity stable');
  t.strictEqual(a.error, b.error, 'sub-channel error identity stable');

  const callsAfterMemoization = calls.count;
  dc.tracingChannel('foo');
  dc.tracingChannel('foo');
  t.equal(calls.count, callsAfterMemoization,
    'memoized lookups do not re-invoke the underlying tracingChannel()');

  t.end();
});

test('tracing-channel stable-identity patch: distinct names get distinct TracingChannels', t => {
  const { tracingChannel } = mockUnpatched();
  const dc = patch({ tracingChannel });

  const foo = dc.tracingChannel('foo');
  const bar = dc.tracingChannel('bar');

  t.notStrictEqual(foo, bar, 'different names return different TracingChannels');
  t.notStrictEqual(foo.start, bar.start, 'different names have different sub-channels');
  t.strictEqual(dc.tracingChannel('foo'), foo, 'foo memoization holds');
  t.strictEqual(dc.tracingChannel('bar'), bar, 'bar memoization holds');
  t.end();
});

test('tracing-channel stable-identity patch: object form is passthrough (not memoized)', t => {
  const { tracingChannel } = mockUnpatched();
  const dc = patch({ tracingChannel });

  const channels = {
    start: { _name: 'custom:start' },
    end: { _name: 'custom:end' },
    asyncStart: { _name: 'custom:asyncStart' },
    asyncEnd: { _name: 'custom:asyncEnd' },
    error: { _name: 'custom:error' },
  };

  const a = dc.tracingChannel(channels);
  const b = dc.tracingChannel(channels);

  // Object form bypasses memoization — caller is providing explicit channels.
  t.notStrictEqual(a, b, 'object form returns a fresh wrapper each time');
  t.ok(a._passthrough, 'first call passes through');
  t.ok(b._passthrough, 'second call passes through');
  t.end();
});
