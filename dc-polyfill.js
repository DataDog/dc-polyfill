const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);

if (hasFullSupport()) {
  module.exports = require('diagnostics_channel');
  return
}

let diagnostics_channel;
let channel_registry;

if (!providesDiagnosticsChannel()) {
  channel_registry = Symbol.for('dc-polyfill');
}



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
