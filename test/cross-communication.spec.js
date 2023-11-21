const test = require('tape');

const { hasDiagnosticsChannel } = require('../checks');

if (!hasDiagnosticsChannel()) {
  test('cross-communication', t => {
    t.comment(`The current version of Node.js, ${process.version}, does not include diagnostics_channel. Skipping test.`);
    t.end();
  });

  return;
}

const polyfill = require('../dc-polyfill.js');
const native = require('../dc-polyfill.js');

test('subscribe in native, publish from polyfill', t => {
  const native_ch = native.channel('foo');
  const polyfill_ch = polyfill.channel('foo');

  t.equal(native_ch.hasSubscribers, false, 'native ch should have no subscribers yet');
  t.equal(polyfill_ch.hasSubscribers, false, 'polyfill ch should have no subscribers yet');

  native.subscribe('foo', (msg) => {
    t.equal(msg, 'bar');
    t.end();
  });

  t.equal(native_ch.hasSubscribers, true, 'native ch should now have subscribers');
  t.equal(polyfill_ch.hasSubscribers, true, 'polyfill ch should now have subscribers');

  polyfill_ch.publish('bar');
});

test('subscribe in polyfill, publish from native', t => {
  const native_ch = native.channel('foo2');
  const polyfill_ch = polyfill.channel('foo2');

  t.equal(native_ch.hasSubscribers, false, 'native ch should have no subscribers yet');
  t.equal(polyfill_ch.hasSubscribers, false, 'polyfill ch should have no subscribers yet');

  polyfill.subscribe('foo2', (msg) => {
    t.equal(msg, 'bar');
    t.end();
  });

  t.equal(native_ch.hasSubscribers, true, 'native ch should now have subscribers');
  t.equal(polyfill_ch.hasSubscribers, true, 'polyfill ch should now have subscribers');

  native_ch.publish('bar');
});

