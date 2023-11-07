const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);
module.exports.MAJOR = MAJOR;
module.exports.MINOR = MINOR;
module.exports.PATCH = PATCH;

function hasFullSupport() {
  return MAJOR >= 20 && MINOR >= 6;
}
module.exports.hasFullSupport = hasFullSupport;

function hasTracingChannel() {
  return MAJOR >= 20;
}
module.exports.hasTracingChannel = hasTracingChannel;

function hasDiagnosticsChannel() {
  return (MAJOR >= 16)
    || (MAJOR === 15 && MINOR >= 1)
    || (MAJOR === 14 && MINOR >= 17);
}
module.exports.hasDiagnosticsChannel = hasDiagnosticsChannel;

function hasTopSubscribeUnsubscribe() {
  return MAJOR >= 20
    || (MAJOR === 16 && MINOR >= 17)
    || (MAJOR === 18 && MINOR >= 7);
}
module.exports.hasTopSubscribeUnsubscribe = hasTopSubscribeUnsubscribe;

function hasGarbageCollectionBug() {
  return hasDiagnosticsChannel() && !hasFullSupport();
}
module.exports.hasGarbageCollectionBug = hasGarbageCollectionBug;

function hasZeroSubscribersBug() {
  return MAJOR === 19 && MINOR === 9;
}
module.exports.hasZeroSubscribersBug = hasZeroSubscribersBug;

function hasChannelStoreMethods() {
  return MAJOR === 20
    || (MAJOR === 19 && MINOR >= 9);
}
module.exports.hasChannelStoreMethods = hasChannelStoreMethods;

// if Channel#unsubscribe() returns a boolean
function hasChUnsubscribeReturn() {
  return (MAJOR >= 18) // 18.0, 19.0, etc.
    || (MAJOR === 14 && MINOR >= 19)
    || (MAJOR === 16 && MINOR >= 14)
    || (MAJOR === 17 && MINOR >= 1);
}
module.exports.hasChUnsubscribeReturn = hasChUnsubscribeReturn;

function hasSyncUnsubscribeBug() {
  return MAJOR === 20 && MINOR <= 5;
}
module.exports.hasSyncUnsubscribeBug = hasSyncUnsubscribeBug;
