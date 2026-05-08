// There's a bug where a newly created channel is immediately garbage collected
// @see https://github.com/nodejs/node/pull/47520
//
// The phony subscriber below keeps a created channel alive, but Node's channel(name)
// can still return a brand-new Channel object for the same name on a subsequent call
// (observed on Node 18 under certain workloads). A WeakSet keyed by Channel-object
// identity can't merge those — each new object is treated as new and gets its own
// phony subscriber. Callers that captured the earlier Channel in a closure end up
// publishing to a different object than later subscribe()-ers attach to.
//
// To make channel identity stable per name (the contract callers expect), memoize
// dc.channel(name) by name and short-circuit before delegating to the underlying
// channel() on subsequent calls.
const PHONY_SUBSCRIBE = function AVOID_GARBAGE_COLLECTION() {};

const {
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor
} = require('./primordials.js');

module.exports = function(unpatched) {
  const dc_channel = unpatched.channel;
  const channels = new WeakSet();
  const byName = new Map();

  const dc = { ...unpatched };

  dc.channel = function() {
    const name = arguments[0];
    if (byName.has(name)) return byName.get(name);
    const ch = dc_channel.apply(this, arguments);
    byName.set(name, ch);

    if (channels.has(ch)) return ch;

    dc_channel(arguments[0]).subscribe(PHONY_SUBSCRIBE);

    channels.add(ch);

    if (!ObjectGetOwnPropertyDescriptor(ch, 'hasSubscribers')) {
      ObjectDefineProperty(ch, 'hasSubscribers', {
        get: function() {
          const subscribers = ch._subscribers;
          if (subscribers.length > 1) return true;
          const stores = ch._stores;
          if (stores.size > 0) return true;
          if (subscribers.length < 1 ) return false;
          if (subscribers[0] === PHONY_SUBSCRIBE) return false;
          return true;
        },
      });
    }

    return ch;
  };

  return dc;
};
