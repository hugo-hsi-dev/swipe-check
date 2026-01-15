<script lang="ts">
	import { resolve } from '$app/paths';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-center text-3xl">Create your account</Card.Title>
			<Card.Description class="text-center">
				Already have an account?
				<a href={resolve('/login' as '/')} class="font-medium text-blue-600 hover:text-blue-500"
					>Sign in</a
				>
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<form method="POST">
				<Field.Group>
					<Field.Field>
						<Field.Label>Email address</Field.Label>
						<Field.Content>
							<Input
								name="email"
								type="email"
								placeholder="you@example.com"
								value={form?.data?.email || ''}
							/>
							{#if form?.errors?.email}
								<Field.Error errors={[{ message: form.errors.email }]} />
							{/if}
						</Field.Content>
					</Field.Field>

					<Field.Field>
						<Field.Label>Username</Field.Label>
						<Field.Content>
							<Input
								name="username"
								type="text"
								placeholder="username"
								value={form?.data?.username || ''}
							/>
							{#if form?.errors?.username}
								<Field.Error errors={[{ message: form.errors.username }]} />
							{/if}
						</Field.Content>
					</Field.Field>

					<Field.Field>
						<Field.Label>Password</Field.Label>
						<Field.Content>
							<Input
								name="password"
								type="password"
								placeholder="••••••••"
							/>
							<Field.Description>
								At least 8 characters, 1 uppercase, 1 lowercase, 1 number
							</Field.Description>
							{#if form?.errors?.password}
								<Field.Error errors={[{ message: form.errors.password }]} />
							{/if}
						</Field.Content>
					</Field.Field>

					<Field.Field>
						<Field.Label>Confirm Password</Field.Label>
						<Field.Content>
							<Input
								name="passwordConfirmation"
								type="password"
								placeholder="••••••••"
							/>
							{#if form?.errors?.passwordConfirmation}
								<Field.Error errors={[{ message: form.errors.passwordConfirmation }]} />
							{/if}
						</Field.Content>
					</Field.Field>

					{#if form?.errors?.form}
						<div class="text-destructive text-sm">
							{form.errors.form}
						</div>
					{/if}

					<Button type="submit" class="w-full">
						Sign up
					</Button>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</div>
