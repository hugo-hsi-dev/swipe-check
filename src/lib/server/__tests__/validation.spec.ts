import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '$lib/validation';
import { safeParse } from 'valibot';

describe('validation', () => {
	describe('registerSchema', () => {
		it('should fail for empty email', () => {
			const result = safeParse(registerSchema, {
				email: '',
				username: 'user',
				password: 'Password123'
			});
			expect(result.success).toBe(false);
		});
		it('should fail for invalid email', () => {
			const result = safeParse(registerSchema, {
				email: 'invalid-email',
				username: 'user',
				password: 'Password123'
			});
			expect(result.success).toBe(false);
		});
		it('should succeed for valid data', () => {
			const result = safeParse(registerSchema, {
				email: 'test@example.com',
				username: 'test_user',
				password: 'Password123'
			});
			expect(result.success).toBe(true);
		});
		it('should fail for weak password', () => {
			const result = safeParse(registerSchema, {
				email: 'test@example.com',
				username: 'test_user',
				password: 'password'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('loginSchema', () => {
		it('should fail for empty email', () => {
			const result = safeParse(loginSchema, { email: '', password: 'Password123' });
			expect(result.success).toBe(false);
		});
		it('should succeed for valid data', () => {
			const result = safeParse(loginSchema, { email: 'test@example.com', password: 'Password123' });
			expect(result.success).toBe(true);
		});
	});
});
