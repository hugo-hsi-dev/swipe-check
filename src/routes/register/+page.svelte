<script lang="ts">
	import { registerUser } from '$lib/auth.remote';
	import { toast } from 'svelte-sonner';
	import { isHttpError } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Field, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<svelte:head>
	<title>Register - Create Account</title>
	<meta name="description" content="Create a new account" />
</svelte:head>

<div class="container mx-auto flex h-screen w-screen flex-col items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">Create Account</CardTitle>
			<CardDescription>Enter your information to create a new account</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				{...registerUser.enhance(async ({ submit }) => {
					try {
						await submit();
					} catch (error) {
						if (isHttpError(error)) {
							toast.error(error.body.message);
						}
						console.error(error);
					}
				})}
				class="space-y-4"
			>
				<Field>
					<Label for="username">Username</Label>
					<Input
						id="username"
						{...registerUser.fields.username.as('text')}
						placeholder="Choose a username"
					/>
					<FieldError errors={registerUser.fields.username.issues()} />
				</Field>

				<Field>
					<Label for="password">Password</Label>
					<Input
						id="password"
						{...registerUser.fields.password.as('password')}
						placeholder="Enter your password"
					/>
					<FieldError errors={registerUser.fields.password.issues()} />
				</Field>

				<Field>
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						{...registerUser.fields.confirmPassword.as('password')}
						placeholder="Confirm your password"
					/>
					<FieldError errors={registerUser.fields.confirmPassword.issues()} />
				</Field>

				<Button type="submit" class="w-full" disabled={!!registerUser.pending}>
					{#if registerUser.pending}
						<Spinner class="mr-2 h-4 w-4" />
					{/if}
					Register
				</Button>
			</form>

			<div class="mt-6 text-center text-sm">
				Already have an account?
				<a href="/demo/lucia/login" class="text-primary hover:underline"> Sign in </a>
			</div>
		</CardContent>
	</Card>
</div>
