import { decrypt, encrypt } from '$lib';
import type { RequestHandler } from '@sveltejs/kit';

export const post: RequestHandler = async ({ request }) => {
	const { payload, secret } = await request.json();

	const encrypted = await encrypt(payload, secret);
	const decrypted = await decrypt(encrypted, secret);

	return {
		body: {
			payload,
			encrypted: {
				value: encrypted,
				size: encrypted.length
			},
			decrypted: {
				value: decrypted
			}
		}
	};
};
