// https://github.com/nodejs/node/pull/48933

module.exports = function(dc) {
  const channels = new WeakSet();

  const dc_channel = dc.channel;

  dc.channel = function() {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    const publish = ch.publish;

    ch.publish = function() {
      if (!ch._subscribers) {
        ch._subscribers = [];
      }

      return publish.apply(ch, arguments);
    };

    return ch;
  };
};
