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

<div class="min-h-screen bg-gradient-to-br from-[--color-primary]/10 via-[--color-secondary]/5 to-[--color-accent]/10 flex items-center justify-center p-4">
	<!-- Logo/Brand -->
	<div class="absolute top-8 left-8">
		<a href="/" class="text-2xl font-bold text-[--color-primary] hover:text-[--color-primary-hover] transition-colors">
			Swipe Check
		</a>
	</div>

	<!-- Login Form -->
	<LoginForm />
</div>
