import { encrypt } from '$lib';
import type { RequestHandler } from '@sveltejs/kit';

export const post: RequestHandler = async ({ request }) => {
	const { payload, secret } = await request.json();
	const encrypted = await encrypt(payload, secret);

	return {
		body: {
			value: encrypted,
			size: encrypted.length
		}
	};
};
