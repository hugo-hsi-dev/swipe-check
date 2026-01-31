import { describe, it, expect } from 'vitest';
import { auth } from './auth';

describe('auth', () => {
	it('should export auth object', () => {
		expect(auth).toBeDefined();
	});

	it('should have api property', () => {
		expect(auth.api).toBeDefined();
	});

	it('should have api.getSession function', () => {
		expect(typeof auth.api.getSession).toBe('function');
	});

	it('should have options property', () => {
		expect(auth.options).toBeDefined();
	});
});
