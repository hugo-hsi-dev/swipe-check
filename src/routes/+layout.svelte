<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if data.currentUser}
	<div class="auth-status">
		<span>Signed in as {data.currentUser.email}</span>
		<a href="/auth/logout">Sign out</a>
	</div>
{:else}
	<div class="auth-status">
		<a href="/auth/login" data-sveltekit-preload-data="hover">Sign in</a>
	</div>
{/if}
