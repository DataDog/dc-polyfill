// Prevent going to 0 subscribers to avoid bug in Node.js
// Only affects version 19.9.0
// @see https://github.com/nodejs/node/pull/47520
const { channel, Channel } = require('diagnostics_channel');

module.exports = function (dc) {
  const channels = new WeakSet();

  dc.channel = function () {
    const ch = channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    const subscribe = ch.subscribe;
    const unsubscribe = ch.unsubscribe;

    ch.subscribe = function () {
      delete ch.subscribe;
      delete ch.unsubscribe;

      const result = subscribe.apply(this, arguments);

      this.subscribe(() => {}); // Keep it active forever.

      return result;
    };

    if (ch.unsubscribe === Channel.prototype.unsubscribe) {
      // Needed because another subscriber could have subscribed to something
      // that we unsubscribe to before the library is loaded.
      ch.unsubscribe = function () {
        delete ch.subscribe;
        delete ch.unsubscribe;

        this.subscribe(() => {}); // Keep it active forever.

        return unsubscribe.apply(this, arguments);
      };
    }

    channels.add(ch);
  }

  return ch;
};
