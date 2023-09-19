module.exports = function (dc) {
  const channels = new WeakSet();

  const dc_channel = dc.channel;

  dc.channel = function() {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    ch.bindStore = function() {
      // TODO
    };

    ch.unbindStore = function() {
      // TODO
    };

    ch.runStores = function() {
      // TODO
    };

    return ch;
  };
};
