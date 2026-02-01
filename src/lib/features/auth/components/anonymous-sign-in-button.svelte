<script lang="ts">
	import { authClient } from '../client/auth.client';

	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	const handleAnonymousSignIn = async () => {
		errorMessage = null;
		isLoading = true;

		try {
			const result = await authClient.signIn.anonymous();

			if (result.error) {
				errorMessage = result.error.message || 'Failed to sign in anonymously';
			} else {
				// Success - the user is now signed in
				console.log('Signed in anonymously:', result.data);
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			console.error('Anonymous sign-in error:', error);
		} finally {
			isLoading = false;
		}
	};
</script>

<button
	onclick={handleAnonymousSignIn}
	disabled={isLoading}
	class="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	type="button"
	aria-label="Sign in anonymously"
>
	{#if isLoading}
		<span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
		<span>Signing in...</span>
	{:else}
		<span>Continue as Guest</span>
	{/if}
</button>

{#if errorMessage}
	<p class="mt-2 text-sm text-red-600" role="alert">{errorMessage}</p>
{/if}
