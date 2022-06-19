import { expect, test } from '@playwright/test';

const SECRET = 'pale-waveform-mainmast-vaulting-swimsuit-warily-calender-beard';

const DEMO_DATA = {
	username: 'mike_wazowski',
	email: 'mike@Wazowski.com',
	name: 'Mike Wazowski',
	role: 'monster',
	todos: [
		{
			id: '9ec42ac8-1201-443d-b90a-e4c0f86d7493',
			text: 'Scare a kid',
			done: false
		},
		{
			id: '1cbee15f-36b3-4a5b-9057-99b5287bd2f6',
			text: 'Scare another kid',
			done: false
		},
		{
			id: '1cbee15f-36b3-4a5b-9057-99b5287bd2f6',
			text: 'Eat',
			done: false
		}
	]
};

test('can encrypt data', async ({ request }) => {
	const response = await request.post('/tests/encrypt', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET
		}
	});

	await expect(response).toBeOK();

	const data = await response.json();

	if (typeof data.size !== 'number') {
		throw new Error('encrypted string should have a size');
	}

	if (typeof data.value !== 'string') {
		throw new Error('encrypted value should be a string');
	}
});

test('can encrypt and decrypt data', async ({ request }) => {
	const response = await request.post('/tests/encrypt_decrypt', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET
		}
	});

	await expect(response).toBeOK();

	const data = await response.json();

	expect(data.payload).toStrictEqual(data.decrypted.value);
	expect(data.encrypted.value).toBeDefined();
});

test('throws if wrong decryption key is used', async ({ request }) => {
	const response = await request.post('/tests/wrong_key', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET
		}
	});

	await expect(response).not.toBeOK();
});

test('[BENCHMARK]: Encrypt', async ({ request }) => {
	const response = await request.post('/tests/benchmark/encrypt', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET,
			runs: 1000
		}
	});

	await expect(response).toBeOK();

	const data = await response.json();

	console.log('[BENCHMARK]: Encrypt -> ', { ...data });
});

test('[BENCHMARK]: Decrypt', async ({ request }) => {
	const response = await request.post('/tests/benchmark/decrypt', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET,
			runs: 1000
		}
	});

	await expect(response).toBeOK();

	const data = await response.json();

	console.log('[BENCHMARK]: Decrypt -> ', { ...data });
});

test('[BENCHMARK]: Encrypt & Decrypt', async ({ request }) => {
	const response = await request.post('/tests/benchmark', {
		data: {
			payload: DEMO_DATA,
			secret: SECRET,
			runs: 1000
		}
	});

	await expect(response).toBeOK();

	const data = await response.json();

	console.log('[BENCHMARK]: Encrypt & Decrypt -> ', { ...data });
});
