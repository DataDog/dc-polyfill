const checks = require('./checks.js');

if (checks.hasFullSupport()) {
  module.exports = require('node:diagnostics_channel');
  return;
}

// TODO: global symbol channel registry when building from scratch

const dc = checks.hasDiagnosticsChannel()
  ? require('diagnostics_channel')
  : require('./reimplementation.js');

if (checks.hasGarbageCollectionBug()) {
  require('./patch-garbage-collection-bug.js')(dc);
}

if (checks.hasZeroSubscribersBug()) {
  require('./patch-zero-subscriber-bug.js')(dc);
}

if (!checks.hasTopSubscribeUnsubscribe()) {
  require('./patch-top-subscribe-unsubscribe.js')(dc);
}

if (!checks.hasChUnsubscribeReturn()) {
  require('./patch-channel-unsubscribe-return.js')(dc);
}

if (!checks.hasTracingChannel()) {
  require('./patch-tracing-channel.js')(dc);
}

module.exports = dc;

