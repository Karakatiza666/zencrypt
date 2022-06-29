export async function polyfill_crypto() {
	if (typeof globalThis === 'undefined') {
		return;
	}

	if ('crypto' in globalThis) {
		return;
	}

	Object.defineProperty(globalThis, 'crypto', {
		enumerable: true,
		configurable: true,
		value: (await import('crypto')).webcrypto
	});
}
