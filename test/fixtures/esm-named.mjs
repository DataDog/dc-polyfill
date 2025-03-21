// Import named exports individually to test each one
import { channel } from 'dc-polyfill';
import { subscribe } from 'dc-polyfill';
import { unsubscribe } from 'dc-polyfill';
import { Channel } from 'dc-polyfill';
import { hasSubscribers } from 'dc-polyfill';
import { tracingChannel } from 'dc-polyfill';

// Simple existence test for each function
console.assert(typeof channel === 'function', 'channel is a function');
console.assert(typeof subscribe === 'function', 'subscribe is a function');
console.assert(typeof unsubscribe === 'function', 'unsubscribe is a function');
console.assert(typeof hasSubscribers === 'function', 'hasSubscribers is a function');
console.assert(typeof tracingChannel === 'function', 'tracingChannel is a function');
console.assert(typeof Channel === 'function', 'Channel is a function');

// Basic API test - not trying to be comprehensive
const ch = channel('test-channel');
const handler = () => {};
ch.subscribe(handler);
subscribe('test-channel', handler);
