import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue({}),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis()
	}
}));

vi.mock('$lib/server/password', () => ({
	hashPassword: vi.fn().mockResolvedValue('hashed_password'),
	verifyPassword: vi.fn().mockResolvedValue(true)
}));

describe('AuthService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('register', () => {
		it('should insert a user with lowered case email and username', async () => {
			const data = { email: 'TEST@example.com', username: 'TestUser', password: 'password123' };
			await authService.register(data);

			expect(db.insert).toHaveBeenCalledWith(table.user);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((db as any).values).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'test@example.com',
					username: 'testuser',
					passwordHash: 'hashed_password'
				})
			);
		});
	});

	describe('generateSessionToken', () => {
		it('should generate a token', () => {
			const token = authService.generateSessionToken();
			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
		});
	});
});
