<script lang="ts">
	import { IconLoader2 } from '@tabler/icons-svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'social';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		class?: string;
	}

	let {
		variant = 'primary',
		disabled = false,
		loading = false,
		type = 'button',
		onclick,
		class: className = ''
	}: Props = $props();

	const variantClasses = $derived(
		variant === 'primary'
			? 'text-white bg-gray-900 border-2 border-gray-950 shadow-[inset_0_-4px_0_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_0_rgba(0,0,0,0.3),0_6px_12px_rgba(0,0,0,0.2)] hover:bg-black hover:shadow-[inset_0_-4px_0_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.1),0_5px_0_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.25)] active:translate-y-[3px] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1),0_1px_0_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)]'
			: variant === 'social'
				? 'text-gray-900 bg-white border-2 border-gray-400 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_0_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.1)] hover:border-gray-600 hover:bg-gray-50 hover:shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_0_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[2px] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_0_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]'
				: 'text-gray-900 bg-white border-2 border-gray-400 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_0_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.1)] hover:border-gray-600 hover:bg-gray-50 hover:shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_0_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[2px] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_0_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]'
	);
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="min-h-[44px] px-4 py-3 text-base font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 {variantClasses} {className}"
>
	{#if loading}
		<IconLoader2 size={20} stroke={2.5} class="animate-spin" />
	{/if}
	<slot />
</button>

