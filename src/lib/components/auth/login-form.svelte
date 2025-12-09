<script lang="ts">
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import FieldError from '$lib/components/ui/field/field-error.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { login } from '$lib/auth/remotes/login';
</script>

<form {...login}>
	<Field orientation="vertical">
		<FieldLabel for="email">Email</FieldLabel>
		<Input {...login.fields.email.as('email')} />
		<FieldError errors={login.fields.email.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="password">Password</FieldLabel>
		<Input {...login.fields.password.as('password')} />
		<FieldError errors={login.fields.password.issues()} />
	</Field>

	<Button type="submit" disabled={!!login.pending}
		>{login.pending ? 'Signing In...' : 'Sign In'}</Button
	>
</form>
