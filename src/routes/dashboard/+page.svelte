<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { signOut } from '../auth.remote';
	import { goto } from '$app/navigation';

	/**
	 * Dashboard Page
	 *
	 * Main authenticated user dashboard
	 * This is a placeholder - will be fully implemented in Task 8
	 */

	// Use Better Auth's reactive session hook
	const session = authClient.useSession();

	async function handleSignOut() {
		await signOut();
		await authClient.signOut();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Dashboard - Swipe Check</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-[--color-primary]/10 via-[--color-secondary]/5 to-[--color-accent]/10 p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<h1 class="text-4xl font-bold text-[--color-gray-900]">Dashboard</h1>
			<button
				onclick={handleSignOut}
				class="px-6 py-2 rounded-[--radius-md]
					   bg-[--color-gray-200] hover:bg-[--color-gray-300]
					   text-[--color-gray-700] font-medium
					   transition-all duration-[--duration-normal]"
			>
				Sign Out
			</button>
		</div>

		<!-- Session Info -->
		{#if $session.isPending}
			<div class="bg-white rounded-[--radius-xl] shadow-[--shadow-lg] p-8">
				<p class="text-[--color-gray-600]">Loading...</p>
			</div>
		{:else if $session.data?.user}
			<div class="bg-white rounded-[--radius-xl] shadow-[--shadow-lg] p-8">
				<h2 class="text-2xl font-bold text-[--color-gray-900] mb-4">
					Welcome, {$session.data.user.name}!
				</h2>
				<p class="text-[--color-gray-600] mb-4">You are successfully signed in.</p>

				<div class="p-4 rounded-[--radius-md] bg-[--color-gray-50] border border-[--color-gray-200]">
					<p class="text-sm text-[--color-gray-700] mb-2">
						<strong>Email:</strong> {$session.data.user.email}
					</p>
					<p class="text-sm text-[--color-gray-700]">
						<strong>User ID:</strong> {$session.data.user.id}
					</p>
				</div>

				<div class="mt-6 p-4 rounded-[--radius-md] bg-[--color-accent]/10 border-2 border-[--color-accent]/20">
					<p class="text-sm text-[--color-accent-active]">
						<strong>Note:</strong> This is a placeholder dashboard. The full dashboard with
						personality tracking will be implemented in Task 8.
					</p>
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-[--radius-xl] shadow-[--shadow-lg] p-8">
				<p class="text-[--color-error]">
					Not authenticated. <a href="/login" class="text-[--color-primary] underline">Sign in</a>
				</p>
			</div>
		{/if}
	</div>
</div>
