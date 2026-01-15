export function validateEmail(email: string): string | null {
	if (!email || !email.trim()) {
		return 'Email is required';
	}
	// Basic RFC 5322 simplified email regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return 'Invalid email address';
	}
	if (email.length > 254) {
		return 'Email address is too long';
	}
	return null;
}

export function validateUsername(username: string): string | null {
	if (!username || !username.trim()) {
		return 'Username is required';
	}
	if (username.length < 3 || username.length > 20) {
		return 'Username must be between 3 and 20 characters';
	}
	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return 'Username can only contain letters, numbers, and underscores';
	}
	return null;
}

export function validatePassword(password: string): string | null {
	if (!password) {
		return 'Password is required';
	}
	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	if (!/[A-Z]/.test(password)) {
		return 'Password must contain an uppercase letter';
	}
	if (!/[a-z]/.test(password)) {
		return 'Password must contain a lowercase letter';
	}
	if (!/[0-9]/.test(password)) {
		return 'Password must contain a number';
	}
	return null;
}
