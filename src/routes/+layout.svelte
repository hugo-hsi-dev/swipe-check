<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { authClient } from '$lib/auth-client';

  let { children } = $props();
  const session = authClient.useSession();
  async function signOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => (location.href = '/auth/sign-in') }
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
    <button on:click={signOut}>Sign out</button>
  </div>
{:else}
  <div>
    <a href="/auth/sign-in">Sign in</a>
  </div>
{/if}
