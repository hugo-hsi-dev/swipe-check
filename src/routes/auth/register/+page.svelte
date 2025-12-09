<script lang="ts">
	import Register from '$lib/components/auth/register-form.svelte';
</script>

<svelte:head>
	<title>Register - Swipe Check</title>
</svelte:head>

<div class="max-w-md mx-auto p-8 border border-border rounded-lg bg-card">
	<h1 class="text-center mb-2 text-card-foreground">Create Account</h1>
	<p class="text-center mb-8 text-muted-foreground">Sign up to get started with Swipe Check</p>

	<Register />

	<p class="text-center mt-6 text-muted-foreground">
		Already have an account? <a href="/auth/login" class="text-primary hover:underline">Sign in</a>
	</p>
</div>
