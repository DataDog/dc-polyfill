console.log('PATCH-CHANNEL-UNSUBSCRIBE-RETURN');

// The ch.unsubscribe() method doesn't return a value // Recent versions return if an unsubscribe succeeded
// @see https://github.com/nodejs/node/pull/40433
module.exports = function (dc) {
  const channels = new WeakSet();

  // TODO: This break reimplementation
  // for example v12 we use the wrong
  // ch.unsubscribe from Channel instead
  // of ActiveChannel

  const dc_channel = dc.channel;
  const dc_Channel = dc.Channel;

  dc.channel = function() {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    const unsubscribe = ch.unsubscribe;

    if (ch.unsubscribe === dc_Channel.prototype.unsubscribe) {
      // Needed because another subscriber could have subscribed to something
      // that we unsubscribe to before the library is loaded.
      ch.unsubscribe = function () {
        delete ch.unsubscribe;

        const oldSubscriberCount = this._subscribers.length;

        unsubscribe.apply(this, arguments);

        return this._subscribers.length < oldSubscriberCount;
      };
    }

    channels.add(ch);

    return ch;
  };
};
