console.log('PATCH-GARBAGE-COLLECTION-BUG');

// There's a bug where a newly created channel is immediately garbage collected
// @see https://github.com/nodejs/node/pull/47520
const PHONY_SUBSCRIBE = function AVOID_GARBAGE_COLLECTION() {};

module.exports = function(dc) {
  const dc_channel = dc.channel;
  const channels = new WeakSet();

  dc.channel = function() {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    dc_channel(arguments[0]).subscribe(PHONY_SUBSCRIBE);

    channels.add(ch);

    Object.defineProperty(ch, 'hasSubscribers', {
      get: function() {
        const subscribers = ch._subscribers;
        if (subscribers.length > 1) return true;
        if (subscribers.length < 1) return false;
        if (subscribers[0] === PHONY_SUBSCRIBE) return false;
        return true;
      },
    });

    return ch;
  };
};
