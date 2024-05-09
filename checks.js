const [ MAJOR, MINOR, PATCH ] = process.versions.node.split('.').map(Number);
module.exports.MAJOR = MAJOR;
module.exports.MINOR = MINOR;
module.exports.PATCH = PATCH;

function hasFullSupport() {
  return MAJOR > 20 || (MAJOR >= 20 && MINOR >= 6);
}
module.exports.hasFullSupport = hasFullSupport;

// TracingChannel _did_ exist before this, but we need to replace everything
// anyway to get early-exit support on all the trace methods.
function hasTracingChannel() {
  return MAJOR >= 22
    || (MAJOR === 21 && MINOR >= 8);
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
  return MAJOR >= 20
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

// if there is a TracingChannel#hasSubscribers() getter
// @see https://github.com/nodejs/node/pull/51915
// TODO: note that we still need to add the TC early exit from this same version
function hasTracingChannelHasSubscribers() {
  return MAJOR >= 22
    || (MAJOR == 20 && MINOR >= 13);
};
module.exports.hasTracingChannelHasSubscribers = hasTracingChannelHasSubscribers;
