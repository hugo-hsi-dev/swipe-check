<script lang="ts">
	import { batchTestRemote } from '../remotes/batch-test.remote';
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<div>{error.message}</div>
	{/snippet}
	<div>{await batchTestRemote('hi')}</div>
</svelte:boundary>
