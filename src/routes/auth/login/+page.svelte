<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

<svelte:head>
	<title>Login - Swipe Check</title>
</svelte:head>

<div class="auth-container">
	<h1>Sign In</h1>
	<p class="auth-description">Welcome back to Swipe Check</p>

	<LoginForm />

	<p class="auth-link">
		Don't have an account? <a href="/auth/register">Create account</a>
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
