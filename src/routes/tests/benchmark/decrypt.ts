import { decrypt, encrypt } from '$lib';
import type { RequestHandler } from '@sveltejs/kit';
import { Benchmark } from './_benchmark';

export const post: RequestHandler = async ({ request }) => {
	const { payload, secret, runs = 1000 } = await request.json();

	const bench = new Benchmark();

    const encrypted = await encrypt(payload, secret);
    
	for (let index = 0; index < runs; index += 1) {
		await decrypt(encrypted, secret);
	}

	const elapsed = bench.elapsed();

	return {
		body: {
			runs,
			elapsed: `${elapsed}ms`,
			each: `${elapsed / runs}ms`
		}
	};
};
