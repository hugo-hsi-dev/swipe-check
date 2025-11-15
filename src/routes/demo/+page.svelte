<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let apiResponse = $state<any>(null);
	let postResponse = $state<any>(null);
	let recordResponse = $state<any>(null);
	let inputText = $state('hello world');
	let recordId = $state('42');
	let loading = $state(false);

	async function fetchHello() {
		loading = true;
		try {
			const response = await fetch('/api/hello');
			apiResponse = await response.json();
		} catch (error) {
			apiResponse = { error: String(error) };
		} finally {
			loading = false;
		}
	}

	async function postData() {
		loading = true;
		try {
			const response = await fetch('/api/data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: inputText })
			});
			postResponse = await response.json();
		} catch (error) {
			postResponse = { error: String(error) };
		} finally {
			loading = false;
		}
	}

	async function fetchRecord() {
		loading = true;
		try {
			const response = await fetch(`/api/records/${recordId}`);
			recordResponse = await response.json();
		} catch (error) {
			recordResponse = { error: String(error) };
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>Remote Functions Demo</h1>
	<p>This page demonstrates SvelteKit's server-side functionality and API endpoints.</p>

	<section>
		<h2>Server-Side Load Function</h2>
		<p>Data loaded on the server before page render:</p>
		<pre>{JSON.stringify(data, null, 2)}</pre>
	</section>

	<section>
		<h2>API Endpoints</h2>

		<div class="api-test">
			<h3>GET /api/hello</h3>
			<button onclick={fetchHello} disabled={loading}>Fetch Hello</button>
			{#if apiResponse}
				<pre>{JSON.stringify(apiResponse, null, 2)}</pre>
			{/if}
		</div>

		<div class="api-test">
			<h3>POST /api/data</h3>
			<input type="text" bind:value={inputText} placeholder="Enter text" />
			<button onclick={postData} disabled={loading}>Process Text</button>
			{#if postResponse}
				<pre>{JSON.stringify(postResponse, null, 2)}</pre>
			{/if}
		</div>

		<div class="api-test">
			<h3>GET /api/records/[id]</h3>
			<input type="text" bind:value={recordId} placeholder="Record ID" />
			<button onclick={fetchRecord} disabled={loading}>Fetch Record</button>
			{#if recordResponse}
				<pre>{JSON.stringify(recordResponse, null, 2)}</pre>
			{/if}
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	h1 {
		color: #ff3e00;
		margin-bottom: 1rem;
	}

	h2 {
		color: #333;
		margin-top: 2rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #ff3e00;
		padding-bottom: 0.5rem;
	}

	h3 {
		color: #666;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	section {
		margin: 2rem 0;
	}

	.api-test {
		background: #f5f5f5;
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 4px;
	}

	pre {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-top: 0.5rem;
	}

	button {
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		margin: 0.5rem 0.5rem 0.5rem 0;
	}

	button:hover:not(:disabled) {
		background: #cc3200;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		margin-right: 0.5rem;
		font-size: 1rem;
	}

	p {
		color: #666;
		line-height: 1.6;
	}
</style>
