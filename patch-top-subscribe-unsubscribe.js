console.log('PATCH-TOP-SUBSCRIBE-UNSUBSCRIBE');

module.exports = function (dc) {
  dc.subscribe = (channel, cb) => {
    return dc.channel(channel).subscribe(cb);
  };
  dc.unsubscribe = (channel, cb) => {
    if (dc.channel(channel).hasSubscribers) {
      return dc.channel(channel).unsubscribe(cb);
    }
  };
};
