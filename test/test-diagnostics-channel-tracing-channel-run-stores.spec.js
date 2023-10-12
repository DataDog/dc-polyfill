'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const { AsyncLocalStorage } = require('async_hooks');

test('test-diagnostics-channel-tracing-channel-run-stores', (t) => {
  t.plan(3);
  const channel = dc.tracingChannel('test');
  const store = new AsyncLocalStorage();

  const context = { foo: 'bar' };

  channel.start.bindStore(store, common.mustCall(() => {
    return context;
  }));

  t.strictEqual(store.getStore(), undefined);
  channel.traceSync(common.mustCall(() => {
    t.deepEqual(store.getStore(), context);
  }));
  t.strictEqual(store.getStore(), undefined);
});
