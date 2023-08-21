'use strict';

// https://github.com/simon-id/diagnostics_channel-polyfill

const util = require('util');
const { ERR_INVALID_ARG_TYPE } = require('./errors.js');

class ActiveChannel {
  subscribe(subscription) {
    if (typeof subscription !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('The "subscription" argument must be of type function', subscription);
    }
    this._subscribers.push(subscription);
  }

  unsubscribe(subscription) {
    const index = this._subscribers.indexOf(subscription);
    if (index === -1) return false;

    this._subscribers.splice(index, 1);

    // When there are no more active subscribers, restore to fast prototype.
    if (!this._subscribers.length) {
      // eslint-disable-next-line no-use-before-define
      Object.setPrototypeOf(this, Channel.prototype);
    }

    return true;
  }

  get hasSubscribers() {
    return true;
  }

  publish(data) {
    for (let i = 0; i < this._subscribers.length; i++) {
      try {
        const onMessage = this._subscribers[i];
        onMessage(data, this.name);
      } catch (err) {
        process.nextTick(() => {
          throw err;
        });
      }
    }
  }
}

class Channel {
  constructor(name) {
    this._subscribers = undefined;
    this.name = name;
  }

  static [Symbol.hasInstance](instance) {
    const prototype = Object.getPrototypeOf(instance);
    return prototype === Channel.prototype ||
           prototype === ActiveChannel.prototype;
  }

  subscribe(subscription) {
    Object.setPrototypeOf(this, ActiveChannel.prototype);
    this._subscribers = [];
    this.subscribe(subscription);
  }

  unsubscribe() {
    return false;
  }

  get hasSubscribers() {
    return false;
  }

  publish() {}
}

const channels = {};

function channel(name) {
  const channel = channels[name];
  if (channel) return channel;

  if (typeof name !== 'string' && typeof name !== 'symbol') {
    throw new ERR_INVALID_ARG_TYPE('The "channel" argument must be one of type string or symbol', name);
  }

  return channels[name] = new Channel(name);
}

function hasSubscribers(name) {
  const channel = channels[name];
  if (!channel) {
    return false;
  }

  return channel.hasSubscribers;
}

function deleteChannel(name) {
  if (channels[name]) {
    channels[name] = null;
    return true;
  }

  return false;
}

module.exports = {
  channel,
  hasSubscribers,
  Channel,
  deleteChannel
};
