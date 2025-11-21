<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Sign Up Form Component
	 *
	 * Playful, game-like form for creating a new account
	 * Uses remote function for server-side validation and user creation
	 * Mobile-first optimized for PWA
	 */

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		loading = true;
		error = null;
		success = false;

		try {
			const form = event.target as HTMLFormElement;
			const formData = new FormData(form);

			// Extract form data
			const name = formData.get('name') as string;
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			// Call Better Auth client directly
			const result = await authClient.signUp.email({
				name,
				email,
				password
			});

			if (result.error) {
				error = 'Failed to create account. Email may already be in use.';
			} else {
				success = true;
				// Redirect to dashboard
				setTimeout(() => {
					goto('/dashboard');
				}, 1500);
			}
		} catch (err: any) {
			error = err?.message || 'An unexpected error occurred. Please try again.';
			console.error('Sign up error:', err);
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
			<h2 class="text-3xl font-bold text-[--color-gray-900] mb-2">Create Account</h2>
			<p class="text-[--color-gray-600]">Join Swipe Check to track your personality!</p>
		</div>

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Name input -->
			<div>
				<label for="name" class="block text-sm font-medium text-[--color-gray-700] mb-2">
					Name
				</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					disabled={loading}
					class="w-full px-4 py-3 rounded-[--radius-md] border-2 border-[--color-gray-300]
						   focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20
						   disabled:opacity-50 disabled:cursor-not-allowed
						   transition-all duration-[--duration-normal]
						   text-[--color-gray-900] placeholder:text-[--color-gray-400]"
					placeholder="Your name"
				/>
			</div>

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
					minlength="8"
					disabled={loading}
					class="w-full px-4 py-3 rounded-[--radius-md] border-2 border-[--color-gray-300]
						   focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20
						   disabled:opacity-50 disabled:cursor-not-allowed
						   transition-all duration-[--duration-normal]
						   text-[--color-gray-900] placeholder:text-[--color-gray-400]"
					placeholder="At least 8 characters"
				/>
				<p class="mt-1 text-xs text-[--color-gray-500]">Must be at least 8 characters long</p>
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

			<!-- Success message -->
			{#if success}
				<div
					class="p-4 rounded-[--radius-md] bg-[--color-success]/10 border-2 border-[--color-success]/20
						   text-[--color-success] text-sm"
				>
					Account created successfully! Redirecting to login...
				</div>
			{/if}

			<!-- Submit button -->
			<Button
				type="submit"
				variant="primary"
				disabled={loading}
				{loading}
				class="w-full"
			>
				{loading ? 'Creating account...' : 'SIGN UP'}
			</Button>
		</form>

		<!-- Footer -->
		<div class="mt-6 text-center">
			<p class="text-sm text-[--color-gray-600]">
				Already have an account?
				<a
					href="/login"
					class="text-[--color-primary] hover:text-[--color-primary-hover] font-medium
						   transition-colors duration-[--duration-fast]"
				>
					Sign in
				</a>
			</p>
		</div>
	</div>
</div>
