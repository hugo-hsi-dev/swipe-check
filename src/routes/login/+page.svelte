<script lang="ts">
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import { authClient } from '$lib/features/auth/client/auth.client';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { goto } from '$app/navigation';

	let isLoading = $state(false);

	async function handleSignIn() {
		isLoading = true;
		try {
			await authClient.signIn.anonymous();
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto('/get-started');
		} catch (error) {
			console.error('Sign in failed:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-sm">
		<CardHeader>
			<CardTitle>Sign In</CardTitle>
		</CardHeader>
		<CardContent>
			<Button onclick={handleSignIn} disabled={isLoading} class="w-full">
				{isLoading ? 'Signing in...' : 'Sign In Anonymously'}
			</Button>
		</CardContent>
	</Card>
</div>
