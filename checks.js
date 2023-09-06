const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);

function hasFullSupport() {
  return MAJOR >= 20;
}
module.exports.hasFullSupport = hasFullSupport;

function providesTracingChannel() {
  return hasFullSupport();
}
module.exports.providesTracingChannel = providesTracingChannel;

function providesTopSubscribeUnsubscribe() {
  return hasFullSupport()
    || (MAJOR === 16 && MINOR >= 17)
    || (MAJOR === 18 && MINOR >= 7);
}
module.exports.providesTopSubscribeUnsubscribe = providesTopSubscribeUnsubscribe;

function providesDiagnosticsChannel() {
  return providesTopSubscribeUnsubscribe()
    || (MAJOR >= 16)
    || (MAJOR === 15 && MINOR >= 1)
    || (MAJOR === 14 && MINOR >= 17);
}
module.exports.providesDiagnosticsChannel = providesDiagnosticsChannel;

function hasGarbageCollectionBug() {
  return providesDiagnosticsChannel()
    && !hasFullSupport();
}
module.exports.hasGarbageCollectionBug = hasGarbageCollectionBug;

function hasZeroSubscribersBug() {
  return MAJOR === 19 && MINOR === 9;
}
module.exports.hasZeroSubscribersBug = hasZeroSubscribersBug;
