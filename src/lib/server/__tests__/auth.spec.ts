import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

// Mock DB
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
		set: vi.fn().mockReturnThis(),
	}
}));

describe('AuthService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createUser', () => {
		it('should insert a user with lowered case email and username', async () => {
			const data = { email: 'TEST@example.com', username: 'TestUser', passwordHash: 'hash' };
			await AuthService.createUser(data);
			
			expect(db.insert).toHaveBeenCalledWith(table.user);
			expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
				email: 'test@example.com',
				username: 'testuser',
				passwordHash: 'hash'
			}));
		});
	});

	describe('session', () => {
		it('should generate a token', () => {
			const token = AuthService.session.generateToken();
			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
		});
	});
});
