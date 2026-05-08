'use strict';

const test = require('tape');
const checks = require('../checks.js');
const dc = require('../dc-polyfill.js');

// Partial object-form TracingChannels are only accepted by the JS polyfill
// path (Node < 18.19). Native diagnostics_channel rejects them at construction.
if (checks.hasTracingChannel()) {
  test.skip('partial object-form TC is only accepted by the polyfill', () => {});
} else {
  test('polyfill traceSync with partial {start, end, error} object works', (t) => {
    const start = dc.channel('partial:start');
    const end = dc.channel('partial:end');
    const error = dc.channel('partial:error');
    const tc = dc.tracingChannel({ start, end, error });

    t.doesNotThrow(() => tc.hasSubscribers, 'hasSubscribers must not throw');
    t.strictEqual(tc.hasSubscribers, false);
    t.strictEqual(tc.traceSync(() => 7, {}, null), 7);
    t.end();
  });
}
