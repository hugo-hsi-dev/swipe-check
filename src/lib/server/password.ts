import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt
 * Returns a string in format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	try {
		const parts = hash.split(':');
		if (parts.length !== 2) {
			return false;
		}

		const [salt, key] = parts;
		if (!salt || !key) {
			return false;
		}

		const keyBuffer = Buffer.from(key, 'hex');
		const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

		// Ensure both buffers are same length to prevent timing side-channel
		if (keyBuffer.length !== derivedKey.length) {
			return false;
		}

		return timingSafeEqual(keyBuffer, derivedKey);
	} catch {
		// Any error in parsing/comparing means verification failed
		return false;
	}
}
