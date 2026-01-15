import { describe, it, expect } from 'vitest';
import { validateEmail, validateUsername, validatePassword } from '../validation';

describe('validation', () => {
	describe('validateEmail', () => {
		it('should return error for empty email', () => {
			expect(validateEmail('')).toBe('Email is required');
		});
		it('should return error for invalid email', () => {
			expect(validateEmail('invalid-email')).toBe('Invalid email address');
		});
		it('should return null for valid email', () => {
			expect(validateEmail('test@example.com')).toBeNull();
		});
	});

	describe('validateUsername', () => {
		it('should return error for empty username', () => {
			expect(validateUsername('')).toBe('Username is required');
		});
		it('should return error for short username', () => {
			expect(validateUsername('ab')).toBe('Username must be between 3 and 20 characters');
		});
		it('should return error for invalid characters', () => {
			expect(validateUsername('user!@#')).toBe('Username can only contain letters, numbers, and underscores');
		});
		it('should return null for valid username', () => {
			expect(validateUsername('test_user')).toBeNull();
		});
	});

	describe('validatePassword', () => {
		it('should return error for empty password', () => {
			expect(validatePassword('')).toBe('Password is required');
		});
		it('should return error for short password', () => {
			expect(validatePassword('Pass12')).toBe('Password must be at least 8 characters');
		});
		it('should return error for no uppercase', () => {
			expect(validatePassword('password123')).toBe('Password must contain an uppercase letter');
		});
		it('should return null for valid password', () => {
			expect(validatePassword('Password123')).toBeNull();
		});
	});
});
