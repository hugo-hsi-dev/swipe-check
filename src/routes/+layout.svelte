<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { children } = $props();
	const session = authClient.useSession();
	async function signOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/auth/sign-in');
				}
			}
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if $session.data}
	<div>
		<span>Signed in as {$session.data.user?.email}</span>
		<button onclick={signOut}>Sign out</button>
	</div>
{:else}
	<div>
		<a href="/auth/sign-in" data-sveltekit-preload-data="hover">Sign in</a>
	</div>
{/if}
