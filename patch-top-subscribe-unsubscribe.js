console.log('PATCH-TOP-SUBSCRIBE-UNSUBSCRIBE');

module.exports = function (dc) {
  dc.subscribe = (channel, cb) => {
    return dc.channel(channel).subscribe(cb);
  };
  dc.unsubscribe = (channel, cb) => {
    const ch = dc.channel(channel);
    console.log(String(ch.unsubscribe));

      return ch.unsubscribe(cb);
  };
};
