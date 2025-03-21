import dc from 'dc-polyfill';

// Verify the default export has all the expected methods
console.assert(typeof dc.channel === 'function', 'dc.channel is a function');
console.assert(typeof dc.hasSubscribers === 'function', 'dc.hasSubscribers is a function');
console.assert(typeof dc.Channel === 'function', 'dc.Channel is a function/class');

// Create a channel and ensure the API works
const ch = dc.channel('test-channel');
console.assert(ch instanceof dc.Channel, 'channel instance should be instance of Channel');
