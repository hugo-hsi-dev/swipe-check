<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	const sessionStore = authClient.useSession();

	async function submit(e: Event) {
		e.preventDefault();
		error = '';
		const { error: err } = await authClient.signIn.email(
			{ email, password },
			{
				onError(ctx) {
					error = ctx.error.message;
				},
				onSuccess() {
					goto('/dashboard');
				}
			}
		);
		if (err) error = err.message ?? 'An error occurred';
	}

	onMount(() => {
		if ($sessionStore.data) {
			goto('/dashboard');
		}
	});
</script>

<h1>Sign In</h1>
<form on:submit={submit}>
	<label>
		Email
		<input type="email" bind:value={email} required />
	</label>
	<label>
		Password
		<input type="password" bind:value={password} required />
	</label>
	{#if error}<p style="color:red">{error}</p>{/if}
	<button type="submit">Sign In</button>
</form>
<p><a href="/auth/sign-up" data-sveltekit-preload-data="hover">Create account</a></p>
