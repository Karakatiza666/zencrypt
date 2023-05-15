import {
	ALGORITHM,
	CRYPTO_KEY_PROPERTIES,
	DEFAULT_OPTIONS,
	HASH_ALGORITHM,
	HASH_BYTE_INCREMENT,
	PARSEINT_TO_HEX,
	STRIP_LEADING_CRYPT_HEX,
	STRIP_LEADING_HASH_HEX,
	TYPED_ARRAY_TYPES,
	UNHEX_INDEX_MULTIPLIER,
	type ZencryptOptions
} from './constants.js';

const textEncoder = new TextEncoder()

export const getObjectClass = (value: any) => Object.prototype.toString.call(value);

export const getTypedArray = (buffer: any) => new Uint8Array(buffer);

export const getBufferFromHexString = (hex: string) => {
	const length = hex.length / UNHEX_INDEX_MULTIPLIER;
	const typedArray = getTypedArray(new ArrayBuffer(length));

	let hexIndex;

	for (let index = 0; index < length; index++) {
		hexIndex = index * UNHEX_INDEX_MULTIPLIER;

		typedArray[index] = parseInt(hex[hexIndex] + hex[hexIndex + 1], 16);
	}

	return typedArray.buffer;
};

export const getHexStringForCrypt = (typedArray: ArrayBufferLike) => {
	const byteArray = Array.prototype.slice.call(
		// @ts-ignore
		typedArray.buffer ? typedArray : getTypedArray(typedArray),
		0
	);

	let hexString = '';

	for (let index = 0; index < byteArray.length; index++) {
		hexString += `00${byteArray[index].toString(PARSEINT_TO_HEX).toUpperCase()}`.slice(
			STRIP_LEADING_CRYPT_HEX
		);
	}

	return hexString;
};

export const getHexStringForHash = (typedArray: any) => {
	const view = new DataView(typedArray.buffer);

	let hexString = '';

	for (let index = 0; index < view.byteLength; index += HASH_BYTE_INCREMENT) {
		hexString += `00000000${view.getUint32(index).toString(PARSEINT_TO_HEX)}`.slice(
			STRIP_LEADING_HASH_HEX
		);
	}

	return hexString;
};

export const getNormalizedSecret = (
	secret: any,
	options: { stringify: ZencryptOptions['stringify'] }
) => (typeof secret === 'string' ? secret : options.stringify(secret));

export const getNormalizedOptions = (options: Partial<ZencryptOptions>) => ({
	...DEFAULT_OPTIONS,
	...options
});

export const isArrayBuffer = (value: any) => getObjectClass(value) === '[object ArrayBuffer]';

export const isCryptoKey = (value: any) => {
	if (getObjectClass(value) === '[object CryptoKey]') {
		return true;
	}

	if (!value || typeof value !== 'object') {
		return false;
	}

	for (let index = 0; index < CRYPTO_KEY_PROPERTIES.length; index++) {
		// eslint-disable-next-line max-depth
		if (!Object.prototype.hasOwnProperty.call(value, CRYPTO_KEY_PROPERTIES[index])) {
			return false;
		}
	}

	return true;
};

export const isPlainObject = (value: any) => !!value && getObjectClass(value) === '[object Object]';

export const isTypedArray = (value: any) => !!TYPED_ARRAY_TYPES[getObjectClass(value)];

export const subtleDecrypt = (
	cryptoKey: CryptoKey,
	encrypted: string,
	options: ZencryptOptions
) => {
	const ivHex = encrypted.slice(0, options.ivSize * UNHEX_INDEX_MULTIPLIER);
	const textHex = encrypted.slice(options.ivSize * UNHEX_INDEX_MULTIPLIER);

	return crypto.subtle.decrypt(
		{
			iv: getTypedArray(getBufferFromHexString(ivHex)),
			name: ALGORITHM,
			tagLength: 128
		},
		cryptoKey,
		getBufferFromHexString(textHex)
	);
};

export const subtleDigest = (encodedKey: any, algorithm: string) =>
	crypto.subtle.digest({ name: algorithm.toUpperCase() }, encodedKey);

export const subtleEncrypt = async (
	cryptoKey: CryptoKey,
	value: unknown,
	options: ZencryptOptions
) => {
	const iv = crypto.getRandomValues(getTypedArray(options.ivSize));

	const buffer = await crypto.subtle.encrypt(
		{
			iv,
			name: ALGORITHM,
			tagLength: 128
		},
		cryptoKey,
		// @ts-ignore
		options.serialize
			? options.serialize(value)
			: textEncoder.encode(options.stringify(value))
	);

	return {
		buffer,
		iv
	};
};

export const subtleGenerateKey = (options: Pick<ZencryptOptions, 'keyLength'>) =>
	crypto.subtle.generateKey(
		{
			length: options.keyLength,
			name: ALGORITHM
		},
		false,
		['decrypt', 'encrypt']
	);

export const subtleImportKey = (hash: ArrayBufferLike, type: KeyUsage) =>
	crypto.subtle.importKey('raw', hash, ALGORITHM, false, [type]);

export const getCryptoHash = (secret: any, algorithm: string, options: ZencryptOptions) =>
	Promise.resolve(
		isTypedArray(secret)
			? secret
			: isArrayBuffer(secret)
			? getTypedArray(secret)
			: // @ts-ignore
			  textEncoder.encode(getNormalizedSecret(secret, options))
	)
		.then((encodedKey) => subtleDigest(encodedKey, algorithm))
		.then(getTypedArray);

export const getCryptoKey = (
	secret: string,
	type: KeyUsage,
	options: ZencryptOptions
): Promise<CryptoKey> =>
	isCryptoKey(secret)
		? (Promise.resolve(secret) as any as Promise<CryptoKey>)
		: getCryptoHash(secret, HASH_ALGORITHM, options).then((hash) => subtleImportKey(hash, type));

export const rejectsAttempt = (value: string, action: string) =>
	Promise.reject(new ReferenceError(`The ${value} must be ${action}.`));

export const throwsProcessing = (type: string) => (error: Error) => {
	const err = new Error(`Could not ${type} this value.`);
	err.stack += '\n' + error.stack;
	return err;
};
