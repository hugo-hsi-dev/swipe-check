<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';

	/**
	 * Login Page
	 *
	 * Allows users to sign in to their account
	 */
</script>

<svelte:head>
	<title>Sign In - Swipe Check</title>
	<meta name="description" content="Sign in to your Swipe Check account" />
</svelte:head>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Main content area -->
	<main class="flex-1 flex items-center justify-center py-4 sm:py-6">
		<LoginForm />
	</main>
</div>
