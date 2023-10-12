'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const { AsyncLocalStorage } = require('async_hooks');

test('test-diagnostics-channel-tracing-channel-promise-run-stores', (t) => {
  t.plan(4);

  const channel = dc.tracingChannel('test');
  const store = new AsyncLocalStorage();

  const firstContext = { foo: 'bar' };
  const secondContext = { baz: 'buz' };

  channel.start.bindStore(store, common.mustCall(() => {
    return firstContext;
  }));

  channel.asyncStart.bindStore(store, common.mustNotCall(() => {
    return secondContext;
  }));

  t.strictEqual(store.getStore(), undefined);
  channel.tracePromise(common.mustCall(async () => {
    t.deepEqual(store.getStore(), firstContext);
    await sleep(1);
    // Should _not_ switch to second context as promises don't have an "after"
    // point at which to do a runStores.
    t.deepEqual(store.getStore(), firstContext);
  }));
  t.strictEqual(store.getStore(), undefined);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
