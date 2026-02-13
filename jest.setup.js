// 1. MUST BE FIRST: Polyfill Node.js globals for jsdom environment
const { TextDecoder, TextEncoder } = require("node:util");
const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web");
const { MessageChannel } = require("node:worker_threads");

const { port1 } = new MessageChannel();

// Mock BroadcastChannel for MSW
class BroadcastChannelMock {
	constructor() {}
	postMessage() {}
	close() {}
	addEventListener() {}
	removeEventListener() {}
}

Object.defineProperties(globalThis, {
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder },
	ReadableStream: { value: ReadableStream },
	WritableStream: { value: WritableStream },
	TransformStream: { value: TransformStream },
	MessagePort: { value: Object.getPrototypeOf(port1).constructor },
	BroadcastChannel: { value: BroadcastChannelMock },
});

// 2. Third-party testing matchers
require("@testing-library/jest-dom");

// 3. Polyfill Fetch APIs BEFORE importing MSW
const { fetch, Headers, Request, Response } = require("undici");
Object.assign(globalThis, { fetch, Headers, Request, Response });

// 4. Now safe to import MSW server setup
const { server } = require("./src/__tests__/mocks/server");

// ... remaining lifecycle (beforeAll, afterEach, afterAll)


// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
