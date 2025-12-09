<script lang="ts">
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import FieldError from '$lib/components/ui/field/field-error.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { registerUser } from '$lib/auth/remotes/registerUser';
</script>

<form {...registerUser}>
	<Field orientation="vertical">
		<FieldLabel for="name">Name</FieldLabel>
		<Input {...registerUser.fields.name.as('text')} />
		<FieldError errors={registerUser.fields.name.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="email">Email</FieldLabel>
		<Input {...registerUser.fields.email.as('email')} />
		<FieldError errors={registerUser.fields.email.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="password">Password</FieldLabel>
		<Input {...registerUser.fields.password.as('password')} />
		<FieldError errors={registerUser.fields.password.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="confirmPassword">Confirm Password</FieldLabel>
		<Input {...registerUser.fields.confirmPassword.as('password')} />
		<FieldError errors={registerUser.fields.confirmPassword.issues()} />
	</Field>

	<Button type="submit" disabled={!!registerUser.pending}
		>{registerUser.pending ? 'Creating Account...' : 'Create Account'}</Button
	>
</form>
