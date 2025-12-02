<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
</script>

<svelte:head>
	<title>Register - Swipe Check</title>
</svelte:head>

<div class="auth-container">
	<h1>Create Account</h1>
	<p class="auth-description">Sign up to get started with Swipe Check</p>

	<RegisterForm />

	<p class="auth-link">
		Already have an account? <a href="/auth/login">Sign in</a>
	</p>
</div>

<style>
	.auth-container {
		max-width: 400px;
		margin: 2rem auto;
		padding: 2rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--background);
	}

	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: var(--foreground);
	}

	.auth-description {
		text-align: center;
		margin-bottom: 2rem;
		color: var(--muted-foreground);
	}

	.auth-link {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--muted-foreground);
	}

	.auth-link a {
		color: var(--primary);
		text-decoration: none;
	}

	.auth-link a:hover {
		text-decoration: underline;
	}
</style>
