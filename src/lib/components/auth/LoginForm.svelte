<script lang="ts">
	import { signIn } from '../../routes/auth.remote';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	/**
	 * Login Form Component
	 *
	 * Playful, game-like form for signing into an existing account
	 * Uses remote function for server-side validation and authentication
	 */

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		loading = true;
		error = null;

		try {
			// Call remote function for sign in
			const result = await signIn(formData);

			if (result.success) {
				// Force session refresh to ensure user is authenticated
				await authClient.session.refresh();
				// Redirect to dashboard after successful login
				goto('/dashboard');
			} else {
				error = result.error || 'Invalid email or password. Please try again.';
			}
		} catch (err: any) {
			error = err?.message || 'An unexpected error occurred. Please try again.';
			console.error('Sign in error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-full max-w-md mx-auto">
	<!-- Card container with playful styling -->
	<div class="bg-white rounded-[--radius-xl] shadow-[--shadow-xl] p-8">
		<!-- Header -->
		<div class="mb-6 text-center">
			<h2 class="text-3xl font-bold text-[--color-gray-900] mb-2">Welcome Back</h2>
			<p class="text-[--color-gray-600]">Sign in to continue your personality journey!</p>
		</div>

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Email input -->
			<div>
				<label for="email" class="block text-sm font-medium text-[--color-gray-700] mb-2">
					Email
				</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					disabled={loading}
					class="w-full px-4 py-3 rounded-[--radius-md] border-2 border-[--color-gray-300]
						   focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20
						   disabled:opacity-50 disabled:cursor-not-allowed
						   transition-all duration-[--duration-normal]
						   text-[--color-gray-900] placeholder:text-[--color-gray-400]"
					placeholder="your@email.com"
				/>
			</div>

			<!-- Password input -->
			<div>
				<label for="password" class="block text-sm font-medium text-[--color-gray-700] mb-2">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					disabled={loading}
					class="w-full px-4 py-3 rounded-[--radius-md] border-2 border-[--color-gray-300]
						   focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20
						   disabled:opacity-50 disabled:cursor-not-allowed
						   transition-all duration-[--duration-normal]
						   text-[--color-gray-900] placeholder:text-[--color-gray-400]"
					placeholder="Your password"
				/>
			</div>

			<!-- Error message -->
			{#if error}
				<div
					class="p-4 rounded-[--radius-md] bg-[--color-error]/10 border-2 border-[--color-error]/20
						   text-[--color-error] text-sm"
				>
					{error}
				</div>
			{/if}

			<!-- Submit button -->
			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 px-6 rounded-[--radius-md]
					   bg-[--color-primary] hover:bg-[--color-primary-hover] active:bg-[--color-primary-active]
					   text-white font-semibold
					   disabled:opacity-50 disabled:cursor-not-allowed
					   transition-all duration-[--duration-normal]
					   shadow-[--shadow-md] hover:shadow-[--shadow-lg]
					   transform hover:scale-[1.02] active:scale-[0.98]"
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<!-- Footer -->
		<div class="mt-6 text-center">
			<p class="text-sm text-[--color-gray-600]">
				Don't have an account?
				<a
					href="/signup"
					class="text-[--color-primary] hover:text-[--color-primary-hover] font-medium
						   transition-colors duration-[--duration-fast]"
				>
					Sign up
				</a>
			</p>
		</div>
	</div>
</div>
