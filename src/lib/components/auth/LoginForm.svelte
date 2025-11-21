<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Login Form Component
	 *
	 * Friendly, gamified login form for signing into an existing account
	 * Mobile-first optimized for PWA
	 */

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(event: SubmitEvent) {
		loading = true;
		error = null;

		try {
			const form = event.target as HTMLFormElement;
			const formData = new FormData(form);

			// Extract form data
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			// Call Better Auth client directly
			const result = await authClient.signIn.email({
				email,
				password
			});

			if (result.error) {
				error = 'Invalid email or password. Please try again.';
			} else {
				// Redirect to dashboard after successful login
				goto('/dashboard');
			}
		} catch (err: any) {
			error = err?.message || 'An unexpected error occurred. Please try again.';
			console.error('Sign in error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<!-- Main form content -->
<div class="w-full px-4 sm:px-6 py-6 flex flex-col gap-4 sm:gap-6">
	<!-- Header -->
	<h1 class="text-4xl sm:text-5xl font-bold text-gray-900 text-center m-0 tracking-tight mb-6">Log in</h1>

		<!-- Form -->
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<!-- Email input -->
			<div class="relative w-full">
				<IconMail
					size={20}
					stroke={2}
					class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
				/>
				<input
					type="email"
					id="email"
					name="email"
					required
					disabled={loading}
					class="w-full pl-12 pr-4 py-3.5 text-base text-gray-900 bg-gray-100 rounded-full transition-all duration-200 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-400/30 disabled:opacity-60 disabled:cursor-not-allowed"
					placeholder="Email or username"
				/>
			</div>

			<!-- Password input with forgot link -->
			<div class="relative w-full">
				<IconLock
					size={20}
					stroke={2}
					class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
				/>
				<input
					type="password"
					id="password"
					name="password"
					required
					disabled={loading}
					class="w-full pl-12 pr-20 py-3.5 text-base text-gray-900 bg-gray-100 rounded-full transition-all duration-200 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-400/30 disabled:opacity-60 disabled:cursor-not-allowed"
					placeholder="Password"
				/>
				<a href="/forgot-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 no-underline uppercase tracking-wider transition-colors duration-200 hover:text-black">FORGOT?</a>
			</div>

			<!-- Error message -->
			{#if error}
				<div class="p-3 px-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-900 text-sm flex items-start gap-2 animate-shake">
					<IconAlertCircle size={20} stroke={2} class="flex-shrink-0 mt-0.5" />
					<span>{error}</span>
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
				{#if loading}
					Logging in...
				{:else}
					LOG IN
				{/if}
			</Button>
		</form>

		<!-- Divider -->
		<div class="flex items-center gap-4 my-2">
			<div class="flex-1 h-px bg-gray-300"></div>
			<span class="text-xs font-semibold text-gray-500 uppercase tracking-widest">OR</span>
			<div class="flex-1 h-px bg-gray-300"></div>
		</div>

		<!-- Social login buttons -->
		<div class="grid grid-cols-2 gap-3">
			<Button type="button" variant="social" disabled class="w-full text-sm">
				<span class="text-lg font-bold w-5 h-5 flex items-center justify-center">G</span>
				<span>GOOGLE</span>
			</Button>
			<Button type="button" variant="social" disabled class="w-full text-sm">
				<span class="text-lg font-bold w-5 h-5 flex items-center justify-center">f</span>
				<span>FACEBOOK</span>
			</Button>
		</div>

		<!-- Sign up link -->
		<div class="text-center text-sm sm:text-[0.9375rem] text-gray-900 font-semibold mt-4">
			<span>Don't have an account? </span>
			<a href="/signup" class="text-gray-900 font-bold no-underline uppercase tracking-wider hover:underline">SIGN UP</a>
		</div>

		<!-- Terms and Privacy -->
		<div class="text-center text-xs text-gray-500 leading-relaxed mt-6 mb-2 [&_p]:my-1">
			<p>
				By signing in to Swipe Check, you agree to our{' '}
				<a href="/terms" class="text-gray-900 font-semibold no-underline hover:underline whitespace-nowrap">Terms</a>{' '}
				and{' '}
				<a href="/privacy" class="text-gray-900 font-semibold no-underline hover:underline whitespace-nowrap">Privacy Policy</a>.
			</p>
			<p class="text-[0.6875rem]">
				This site is protected by reCAPTCHA Enterprise and the Google{' '}
				<a href="https://policies.google.com/privacy" class="text-gray-900 font-semibold no-underline hover:underline whitespace-nowrap" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{' '}
				and{' '}
				<a href="https://policies.google.com/terms" class="text-gray-900 font-semibold no-underline hover:underline whitespace-nowrap" target="_blank" rel="noopener noreferrer">Terms of Service</a>{' '}
				apply.
			</p>
		</div>
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}

	.animate-shake {
		animation: shake 0.5s ease-in-out;
	}
</style>
