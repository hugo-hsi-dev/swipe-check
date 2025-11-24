<script lang="ts">
	import { getUserData } from '$lib/server/testQuery.remote';

	let { userId } = $props();

	// Using the experimental await syntax with remote query
	const userData = $derived(await getUserData(userId));
</script>

<div class="user-profile">
	<div class="profile">
		<h2>User Profile</h2>
		<div class="user-details">
			<p><strong>ID:</strong> {userData.id}</p>
			<p><strong>Name:</strong> {userData.name}</p>
			<p><strong>Email:</strong> {userData.email}</p>
		</div>
	</div>
</div>

<style>
	.user-profile {
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		max-width: 400px;
		font-family: Arial, sans-serif;
	}

	.profile h2 {
		margin-top: 0;
		color: #333;
	}

	.user-details {
		margin-top: 15px;
	}

	.user-details p {
		margin-bottom: 8px;
		line-height: 1.4;
	}
</style>
