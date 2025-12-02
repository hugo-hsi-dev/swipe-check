<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidateAll } from '$app/navigation';

	let { children, data } = $props();

	const logoutEnhanced = logoutForm.enhance(async () => {
		const response = await fetch('/auth/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			invalidateAll();
		}
		return response;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if data.currentUser}
	<div class="auth-status">
		<span>Signed in as {data.currentUser.email}</span>
		<form action="/auth/logout" method="POST">
			<button type="submit">Sign out</button>
		</form>
	</div>
{:else}
	<div class="auth-status">
		<a href="/auth/login" data-sveltekit-preload-data="hover">Sign in</a>
	</div>
{/if}
