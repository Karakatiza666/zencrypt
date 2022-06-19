import { IS_BROWSER, GLOBAL } from './constants.js';

if (!IS_BROWSER && !GLOBAL['crypto']) {
	Object.defineProperty(globalThis, 'crypto', {
		enumerable: true,
		configurable: true,
		value: (await import('crypto')).webcrypto
	});
}
