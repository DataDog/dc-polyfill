const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);

function hasFullSupport() {
  return MAJOR >= 20;
}
module.exports.hasFullSupport = hasFullSupport;

function hasTracingChannel() {
  return hasFullSupport();
}
module.exports.hasTracingChannel = hasTracingChannel;

function hasTopSubscribeUnsubscribe() {
  return hasFullSupport()
    || (MAJOR === 16 && MINOR >= 17)
    || (MAJOR === 18 && MINOR >= 7);
}
module.exports.hasTopSubscribeUnsubscribe = hasTopSubscribeUnsubscribe;

function hasDiagnosticsChannel() {
  return hasTopSubscribeUnsubscribe()
    || (MAJOR >= 16)
    || (MAJOR === 15 && MINOR >= 1)
    || (MAJOR === 14 && MINOR >= 17);
}
module.exports.hasDiagnosticsChannel = hasDiagnosticsChannel;

function hasGarbageCollectionBug() {
  return hasDiagnosticsChannel()
    && !hasFullSupport();
}
module.exports.hasGarbageCollectionBug = hasGarbageCollectionBug;

function hasZeroSubscribersBug() {
  return MAJOR === 19 && MINOR === 9;
}
module.exports.hasZeroSubscribersBug = hasZeroSubscribersBug;

// if Channel#unsubscribe() returns a boolean
function hasChUnsubscribeReturn() {
  return hasFullSupport()
    || (MAJOR === 14 && MINOR >= 19)
    || (MAJOR === 16 && MINOR >= 14)
    || (MAJOR === 17 && MINOR >= 1)
    || (MAJOR === 18);
}
module.exports.hasChUnsubscribeReturn = hasChUnsubscribeReturn;
