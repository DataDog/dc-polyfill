const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);

if (hasFullSupport()) {
  module.exports = require('node:diagnostics_channel');
  return
}

// TODO: everything else

let dc;
let channel_registry;

if (providesDiagnosticsChannel()) {
  dc = require('diagnostics_channel');
}

if (!providesDiagnosticsChannel()) {
  // TODO
  channel_registry = Symbol.for('dc-polyfill');
  dc = require('./reimplementation.js');
}

if (!providesTopSubscribeUnsubscribe()) {
  dc.subscribe = (channel, cb) => {
    dc.channel(channel).subscribe(cb);
  };
  dc.unsubscribe = (channel, cb) => {
    if (dc.channel(channel).hasSubscribers) {
      dc.channel(channel).unsubscribe(cb);
    }
  };
}

module.exports = dc;



function hasFullSupport() {
  return MAJOR >= 20;
}

function providesTopSubscribeUnsubscribe() {
  return hasFullSupport()
    || (MAJOR === 16 && MINOR >= 17)
    || (MAJOR === 18 && MINOR >= 7);
}

function providesDiagnosticsChannel() {
  return providesTopSubscribeUnsubscribe()
    || (MAJOR >= 16)
    || (MAJOR === 15 && MINOR >= 1)
    || (MAJOR === 14 && MINOR >= 17);
}

function hasGarbageCollectionBug() {
  return providesDiagnosticsChannel()
    && !hasFullSupport()
}
