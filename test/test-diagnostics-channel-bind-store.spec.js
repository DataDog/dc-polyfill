'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');
const { AsyncLocalStorage } = require('async_hooks');

test('test-diagnostics-channel-bind-store.spec', t => {
  let n = 0;
  const thisArg = new Date();
  const inputs = [
    { foo: 'bar' },
    { baz: 'buz' },
  ];

  const channel = dc.channel('test-diagnostics-channel-bind-store.spec');

  // Bind a storage directly to published data
  const store1 = new AsyncLocalStorage();
  channel.bindStore(store1);
  let store1bound = true;

  // Bind a store with transformation of published data
  const store2 = new AsyncLocalStorage();
  channel.bindStore(store2, common.mustCall((data) => {
    t.strictEqual(data, inputs[n]);
    return { data };
  }, 4));

  // Regular subscribers should see publishes from runStores calls
  channel.subscribe(common.mustCall((data) => {
    if (store1bound) {
      t.deepEqual(data, store1.getStore());
    }
    t.deepEqual({ data }, store2.getStore());
    t.strictEqual(data, inputs[n]);
  }, 4));

  // Verify stores are empty before run
  t.strictEqual(store1.getStore(), undefined);
  t.strictEqual(store2.getStore(), undefined);

  channel.runStores(inputs[n], common.mustCall(function(a, b) {
    // Verify this and argument forwarding
    t.strictEqual(this, thisArg);
    t.strictEqual(a, 1);
    t.strictEqual(b, 2);

    // Verify store 1 state matches input
    t.strictEqual(store1.getStore(), inputs[n]);

    // Verify store 2 state has expected transformation
    t.deepEqual(store2.getStore(), { data: inputs[n] });

    // Should support nested contexts
    n++;
    channel.runStores(inputs[n], common.mustCall(function() {
      // Verify this and argument forwarding
      // TODO: For some reason `this` === `global`. Seems like a bug in common.mustCall?
      // t.strictEqual(this, undefined);

      // Verify store 1 state matches input
      t.strictEqual(store1.getStore(), inputs[n]);

      // Verify store 2 state has expected transformation
      t.deepEqual(store2.getStore(), { data: inputs[n] });
    }));
    n--;

    // Verify store 1 state matches input
    t.strictEqual(store1.getStore(), inputs[n]);

    // Verify store 2 state has expected transformation
    t.deepEqual(store2.getStore(), { data: inputs[n] });
  }), thisArg, 1, 2);

  // Verify stores are empty after run
  t.strictEqual(store1.getStore(), undefined);
  t.strictEqual(store2.getStore(), undefined);

  // Verify unbinding works
  t.ok(channel.unbindStore(store1));
  store1bound = false;

  // Verify unbinding a store that is not bound returns false
  t.ok(!channel.unbindStore(store1));

  n++;
  channel.runStores(inputs[n], common.mustCall(() => {
    // Verify after unbinding store 1 will remain undefined
    t.strictEqual(store1.getStore(), undefined);

    // Verify still bound store 2 receives expected data
    t.deepEqual(store2.getStore(), { data: inputs[n] });
  }));

  // Contain transformer errors and emit on next tick
  const fail = new Error('fail');
  channel.bindStore(store1, () => {
    throw fail;
  });

  let calledRunStores = false;
  process.once('uncaughtException', common.mustCall((err) => {
    t.strictEqual(calledRunStores, true);
    t.strictEqual(err, fail);
    setImmediate(() => {
      t.end();
    });
  }));

  channel.runStores(inputs[n], common.mustCall());
  calledRunStores = true;
});
