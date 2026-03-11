<script lang="ts">
	import { signInEmail, signUpEmail, signInSocial } from '../auth.remote';

	async function handleSocialSignIn() {
		try {
			const url = await signInSocial({
				provider: 'github',
				callbackURL: '/demo/better-auth'
			});
			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			console.error('Social sign in failed:', error);
		}
	}
</script>

<h1>Login</h1>

{#each signInEmail.fields.allIssues() as issue (issue)}
	<p class="text-red-500">{issue.message}</p>
{/each}

{#each signUpEmail.fields.allIssues() as issue (issue)}
	<p class="text-red-500">{issue.message}</p>
{/each}

<form {...signInEmail}>
	<label>
		Email
		<input
			{...signInEmail.fields.email.as('email')}
			class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</label>
	<label>
		Password
		<input
			{...signInEmail.fields._password.as('password')}
			class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</label>
	<button class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
		>Login</button
	>
</form>

<form {...signUpEmail} class="mt-4">
	<label>
		Email
		<input
			{...signUpEmail.fields.email.as('email')}
			class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</label>
	<label>
		Password
		<input
			{...signUpEmail.fields._password.as('password')}
			class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</label>
	<label>
		Name (for registration)
		<input
			{...signUpEmail.fields.name.as('text')}
			class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</label>
	<button class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
		>Register</button
	>
</form>

<hr class="my-4" />

<button
	onclick={handleSocialSignIn}
	class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
>
	Sign in with GitHub
</button>
