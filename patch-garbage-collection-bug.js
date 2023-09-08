// There's a bug where a newly created channel is immediately garbage collected
// @see https://github.com/nodejs/node/pull/47520
const PHONY_SUBSCRIBE = function phonySubscribe() {};

module.exports = function(dc) {
  const dc_channel = dc.channel;
  const channels = new WeakSet();

  dc.channel = function() {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    dc_channel(arguments[0]).subscribe(PHONY_SUBSCRIBE);

    channels.add(ch);

    // TODO: replace channel unsubscribe to check if
    // ._subscribers.length === 1 && .subscribers[0] === PHONY_SUBSCRIBE
    // and then lie about .hasSubscribers() ???

    return ch;
  };
};
