<script lang="ts">
	import { loginUser } from '$lib/auth.remote';
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
	<title>Login - Login</title>
	<meta name="description" content="Login to your account" />
</svelte:head>

<div class="container mx-auto flex h-screen w-screen flex-col items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">Login</CardTitle>
			<CardDescription>Enter your credentials to access your account</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				{...loginUser.enhance(async ({ submit }) => {
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
						{...loginUser.fields.username.as('text')}
						placeholder="Enter your username"
					/>
					<FieldError errors={loginUser.fields.username.issues()} />
				</Field>

				<Field>
					<Label for="password">Password</Label>
					<Input
						id="password"
						{...loginUser.fields.password.as('password')}
						placeholder="Enter your password"
					/>
					<FieldError errors={loginUser.fields.password.issues()} />
				</Field>

				<Button type="submit" class="w-full" disabled={!!loginUser.pending}>
					{#if loginUser.pending}
						<Spinner class="mr-2 h-4 w-4" />
					{/if}
					Login
				</Button>
			</form>

			<div class="mt-6 text-center text-sm">
				Don't have an account?
				<a href="/register" class="text-primary hover:underline">Register</a>
			</div>
		</CardContent>
	</Card>
</div>
