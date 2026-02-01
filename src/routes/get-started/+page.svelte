<script lang="ts">
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import { authClient } from '$lib/features/auth/client/auth.client';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();

	async function handleSignOut() {
		await authClient.signOut();
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/login');
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-sm">
		<CardHeader>
			<CardTitle>Welcome</CardTitle>
		</CardHeader>
		<CardContent>
			{#if $session.data}
				<div class="space-y-4">
					<div>
						<p class="text-sm font-medium">User ID</p>
						<p class="text-sm text-muted-foreground">{$session.data.user.id}</p>
					</div>
					<div>
						<p class="text-sm font-medium">Anonymous</p>
						<p class="text-sm text-muted-foreground">
							{$session.data.user.isAnonymous ? 'Yes' : 'No'}
						</p>
					</div>
					<Button onclick={handleSignOut} class="w-full">Sign Out</Button>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No session found</p>
			{/if}
		</CardContent>
	</Card>
</div>
