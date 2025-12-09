<script lang="ts">
	import LoginForm from '$lib/components/auth/login-form.svelte';
</script>

<svelte:head>
	<title>Login - Swipe Check</title>
</svelte:head>

<div class="max-w-md mx-auto p-8 border border-border rounded-lg bg-card">
	<h1 class="text-center mb-2 text-card-foreground">Sign In</h1>
	<p class="text-center mb-8 text-muted-foreground">Welcome back to Swipe Check</p>

	<LoginForm />

	<p class="text-center mt-6 text-muted-foreground">
		Don't have an account? <a href="/auth/register" class="text-primary hover:underline"
			>Create account</a
		>
	</p>
</div>
