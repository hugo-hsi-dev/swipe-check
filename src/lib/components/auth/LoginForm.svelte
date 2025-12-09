<script lang="ts">
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import FieldError from '$lib/components/ui/field/field-error.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { loginUser } from '$lib/auth/remotes/loginUser';
</script>

<form {...loginUser}>
	<Field orientation="vertical">
		<FieldLabel for="email">Email</FieldLabel>
		<Input {...loginUser.fields.email.as('email')} />
		<FieldError errors={loginUser.fields.email.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="password">Password</FieldLabel>
		<Input {...loginUser.fields.password.as('password')} />
		<FieldError errors={loginUser.fields.password.issues()} />
	</Field>

	<Button type="submit" disabled={!!loginUser.pending}
		>{loginUser.pending ? 'Signing In...' : 'Sign In'}</Button
	>
</form>
