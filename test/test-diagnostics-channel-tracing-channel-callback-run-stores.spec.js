'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const { AsyncLocalStorage } = require('async_hooks');

test('test-diagnostics-channel-tracing-channel-callback-run-stores', (t) => {
  t.plan(4);

  const channel = dc.tracingChannel('test');
  const store = new AsyncLocalStorage();

  const firstContext = { foo: 'bar' };
  const secondContext = { baz: 'buz' };

  channel.start.bindStore(store, common.mustCall(() => {
    return firstContext;
  }));

  channel.asyncStart.bindStore(store, common.mustCall(() => {
    return secondContext;
  }));

  t.strictEqual(store.getStore(), undefined);
  channel.traceCallback(common.mustCall((cb) => {
    t.deepEqual(store.getStore(), firstContext);
    setImmediate(cb);
  }), 0, {}, null, common.mustCall(() => {
    t.deepEqual(store.getStore(), secondContext);
  }));
  t.strictEqual(store.getStore(), undefined);
});
