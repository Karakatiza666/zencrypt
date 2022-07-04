// constants
import { HASH_ALGORITHM, VALID_HASH_ALGORITHMS, type ZencryptOptions } from './constants.js';

// utils
import {
	getNormalizedOptions,
	getCryptoHash,
	getCryptoKey,
	getHexStringForCrypt,
	getHexStringForHash,
	isPlainObject,
	rejectsAttempt,
	subtleDecrypt,
	subtleEncrypt,
	subtleGenerateKey,
	throwsProcessing
} from './utils.js';

export const decrypt = async (
	encrypted: string,
	secret: any,
	passedOptions: Partial<ZencryptOptions> = {}
) => {
	if (!secret) {
		return rejectsAttempt('secret', 'provided');
	}

	if (passedOptions && !isPlainObject(passedOptions)) {
		return rejectsAttempt('options', 'a plain object');
	}

	const options = getNormalizedOptions(passedOptions);

	try {
		const cryptoKey = await getCryptoKey(secret, 'decrypt', options);
		const buffer = await subtleDecrypt(cryptoKey, encrypted, options);
		const text = new TextDecoder(options.charset).decode(buffer);
		return options.parse(text);
	} catch (error: any) {
		throw throwsProcessing('decrypt')(error);
	}
};

export const encrypt = async (
	value: any,
	secret: string,
	passedOptions: Partial<ZencryptOptions> = {}
) => {
	if (!secret) {
		return rejectsAttempt('secret', 'provided');
	}

	if (passedOptions && !isPlainObject(passedOptions)) {
		return rejectsAttempt('options', 'a plain object');
	}

	const options = getNormalizedOptions(passedOptions);

	try {
		const cryptoKey = await getCryptoKey(secret, 'encrypt', options);
		const { buffer, iv } = await subtleEncrypt(cryptoKey, options.stringify(value), options);
		return `${getHexStringForCrypt(iv)}${getHexStringForCrypt(buffer)}`;
	} catch (error: any) {
		throw throwsProcessing('encrypt')(error);
	}
};

export const generateSecret = (options: Partial<ZencryptOptions> = {}) =>
	subtleGenerateKey(getNormalizedOptions(options));

export const hash = async (
	value: any,
	algorithm = HASH_ALGORITHM,
	passedOptions: Partial<ZencryptOptions> = {}
) => {
	const options = getNormalizedOptions(passedOptions);

	if (!~VALID_HASH_ALGORITHMS.indexOf(algorithm.toUpperCase())) {
		return rejectsAttempt('algorithm', `one of "${VALID_HASH_ALGORITHMS.join('", "')}"`);
	}

	if (passedOptions && !isPlainObject(passedOptions)) {
		return rejectsAttempt('options - a plain object', 'processing');
	}

	try {
		const buffer = await getCryptoHash(value, algorithm, options);
		// @ts-ignore
		return getHexStringForHash(buffer, options);
	} catch (error: any) {
		throw throwsProcessing('hash')(error);
	}
};
