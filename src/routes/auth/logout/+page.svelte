<script lang="ts">
	// Logout is handled by the server load function
</script>

<svelte:head>
	<title>Logging out - Swipe Check</title>
</svelte:head>

<div class="logout-container">
	<p>Logging out...</p>
</div>

<style>
	.logout-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
		font-size: 1.1rem;
		color: var(--muted-foreground);
	}
</style>
