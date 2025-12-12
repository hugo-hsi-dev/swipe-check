import { beforeEach, describe, expect, it, vi } from 'vitest';
import { batchTestRemote } from '../batch-test.remote';

vi.mock('$app/server', () => {
	const query = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = maybe_fn ?? validate_or_fn;

		const __ = {
			type: 'query'
		};

		Object.defineProperty(fn, '__', { value: __ });

		// Could wrap this in a schema check as well for good measure
		return fn;
	};

	const batch = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = (maybe_fn ?? validate_or_fn) as (
			...args: unknown[]
		) => (...args: unknown[]) => unknown;

		const wrapper = vi.fn((args) => fn([Symbol(), args])(args));

		const __ = {
			type: 'query_batch'
		};

		Object.defineProperty(wrapper, '__', { value: __ });

		// Could wrap this in a schema check as well for good measure
		return wrapper;
	};

	Object.defineProperty(query, 'batch', { value: batch, enumerable: true });

	return {
		query
	};
});

describe('getCurrentUser', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('returns undefined when user is not present in event.locals', async () => {
		// Arrange
		const [result1, result2] = await Promise.all([batchTestRemote('1'), batchTestRemote('2')]);

		// Assert
		expect(batchTestRemote).toHaveBeenCalledTimes(2);
		expect(result1).toBe('1');
		expect(result2).toBe('2');
	});
});
