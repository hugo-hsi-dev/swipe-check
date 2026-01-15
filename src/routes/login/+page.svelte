<script lang="ts">
	import { resolve } from '$app/paths';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Type assertion for form errors to handle SvelteKit's union type
	const errors = $derived(
		form?.errors as { email?: string; password?: string; form?: string } | undefined
	);
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8"
>
	<Card.Root
		class="w-full max-w-md animate-in shadow-lg duration-500 fade-in slide-in-from-bottom-4"
	>
		<Card.Header class="space-y-1">
			<Card.Title class="text-center text-3xl font-semibold tracking-tight">
				Welcome back
			</Card.Title>
			<Card.Description class="text-center text-muted-foreground">
				Don't have an account?
				<a
					href={resolve('/register' as '/')}
					class="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
					>Register</a
				>
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<form method="POST" class="space-y-4">
				<Field.Group>
					<Field.Field>
						<Field.Label>Email address</Field.Label>
						<Field.Content>
							<Input
								name="email"
								type="email"
								placeholder="you@example.com"
								value={form?.data?.email || ''}
								autocapitalize="off"
								autocomplete="email"
							/>
							{#if errors?.email}
								<Field.Error errors={[{ message: errors.email }]} />
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
								autocomplete="current-password"
							/>
							{#if errors?.password}
								<Field.Error errors={[{ message: errors.password }]} />
							{/if}
						</Field.Content>
					</Field.Field>

					{#if errors?.form}
						<div
							class="animate-in rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive duration-300 fade-in slide-in-from-top-2"
						>
							{errors.form}
						</div>
					{/if}

					<Button
						type="submit"
						class="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
					>
						Login
					</Button>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</div>
