export const ALGORITHM: string = 'AES-GCM';

export const CHARSET: string = 'utf-8';

export const CRYPTO_KEY_PROPERTIES: string[] = ['algorithm', 'extractable', 'type', 'usages'];

export const HASH_ALGORITHM: string = 'SHA-256';

export const HASH_BYTE_INCREMENT: number = 4;

export const IV_SIZE: number = 12;

export const KEY_LENGTH: number = 256;

export const PARSEINT_TO_HEX: number = 16;

export const PARSER = (input: string): any => {
	try {
		return JSON.parse(input);
	} catch (error) {
		return input;
	}
};

export const STRINGIFIER = (value: any): string => {
	try {
		return JSON.stringify(value);
	} catch (error) {
		return `${value}`;
	}
};

export const STRIP_LEADING_CRYPT_HEX: number = -2;

export const STRIP_LEADING_HASH_HEX: number = -8;

export const TYPED_ARRAY_TYPES: Record<string, boolean> = {
	'[object Float32Array]': true,
	'[object Float64Array]': true,
	'[object Int8Array]': true,
	'[object Int16Array]': true,
	'[object Int32Array]': true,
	'[object Uint8Array]': true,
	'[object Uint8ClampedArray]': true,
	'[object Uint16Array]': true,
	'[object Uint32Array]': true
};

export const UNHEX_INDEX_MULTIPLIER: number = 2;

export const VALID_HASH_ALGORITHMS: string[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export interface ZencryptOptions {
	charset: string;
	ivSize: number;
	keyLength: number;
	parse: (input: string) => any;
	stringify: (value: any) => string;
	deserialize?: (input: Uint8Array) => any;
	serialize?: (value: any) => Uint8Array;
}

export const DEFAULT_OPTIONS: ZencryptOptions = {
	charset: CHARSET,
	ivSize: IV_SIZE,
	keyLength: KEY_LENGTH,
	parse: PARSER,
	stringify: STRINGIFIER
};
