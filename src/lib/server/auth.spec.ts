import { describe, it, expect } from 'vitest';
import { auth } from '$lib/server/auth';

describe('auth server', () => {
  it('exposes api methods', () => {
    expect(typeof auth.api.getSession).toBe('function');
  });

  it('getSession returns null for unauthenticated requests', async () => {
    const session = await auth.api.getSession({
      headers: new Headers()
    });
    expect(session).toBeNull();
  });

  it('has correct configuration structure', () => {
    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
    expect(typeof auth.api.getSession).toBe('function');
  });
});

