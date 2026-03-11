<script lang="ts">
	import { getCurrentUser, signOut } from './auth.remote';
	import { redirect } from '@sveltejs/kit';

	const user = await getCurrentUser();

	if (!user) {
		redirect(302, '/demo/better-auth/login');
	}

	async function handleSignOut() {
		await signOut();
	}
</script>

<h1>Hi, {user.name}!</h1>
<p>Your user ID is {user.id}.</p>

<button
	onclick={handleSignOut}
	class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
>
	Sign out
</button>
