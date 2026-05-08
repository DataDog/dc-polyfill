// Make dc.tracingChannel(name) return a stable TracingChannel object per name
// on Node versions that have a native tracingChannel BUT also have the
// channel-registry GC bug (Node 16.17–16.x, 18.7–18.x, 20.0–20.5).
//
// On those versions the native tracingChannel(name) constructor calls Node's
// internal channel() to build its five sub-channels (start, end, asyncStart,
// asyncEnd, error). Because the underlying registry can return a brand-new
// Channel object for the same name on a subsequent call, two `tracingChannel(name)`
// invocations can end up with different sub-channel identities. Subscribers
// attached to one TracingChannel's sub-channels then miss publishes from
// another TracingChannel's sub-channels for the same name.
//
// patch-garbage-collection-bug.js memoizes `dc.channel(name)`, but
// native tracingChannel bypasses that wrapper — it goes through Node's
// internal channel() directly. Memoizing the TracingChannel by name closes
// the gap: same name returns the same TC (and therefore the same sub-channels)
// for the lifetime of the process.

module.exports = function (unpatched) {
  const dc = { ...unpatched };
  const original = dc.tracingChannel;
  const byName = new Map();

  dc.tracingChannel = function (nameOrChannels) {
    if (typeof nameOrChannels !== 'string') {
      // Object form — caller is providing explicit sub-channels; passthrough.
      return original.call(this, nameOrChannels);
    }
    if (byName.has(nameOrChannels)) return byName.get(nameOrChannels);
    const tc = original.call(this, nameOrChannels);
    byName.set(nameOrChannels, tc);
    return tc;
  };

  return dc;
};
