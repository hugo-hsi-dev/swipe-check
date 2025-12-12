<script lang="ts">
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import FieldError from '$lib/components/ui/field/field-error.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { register } from '$lib/features/auth/remotes/register.remote';
</script>

<form {...register}>
	<Field orientation="vertical">
		<FieldLabel for="name">Name</FieldLabel>
		<Input {...register.fields.name.as('text')} />
		<FieldError errors={register.fields.name.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="email">Email</FieldLabel>
		<Input {...register.fields.email.as('email')} />
		<FieldError errors={register.fields.email.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="password">Password</FieldLabel>
		<Input {...register.fields.password.as('password')} />
		<FieldError errors={register.fields.password.issues()} />
	</Field>

	<Field orientation="vertical">
		<FieldLabel for="confirmPassword">Confirm Password</FieldLabel>
		<Input {...register.fields.confirmPassword.as('password')} />
		<FieldError errors={register.fields.confirmPassword.issues()} />
	</Field>

	<Button type="submit" disabled={!!register.pending}
		>{register.pending ? 'Creating Account...' : 'Create Account'}</Button
	>
</form>
