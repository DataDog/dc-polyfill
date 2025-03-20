import * as dc from './dc-polyfill.js';

export default dc;

export const {
  Channel,
  channel,
  hasSubscribers,
  subscribe,
  tracingChannel,
  unsubscribe
} = dc;
