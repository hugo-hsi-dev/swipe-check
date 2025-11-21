<script lang="ts">
	import { getServerData, getRecord, processText, submitData, logActivity } from '../data.remote';

	let recordId = $state('42');
	let textToProcess = $state('hello world');
	let activityLog = $state('User viewed demo page');

	// You can await remote functions directly in the template or in reactive statements
	let serverData = $derived(getServerData());
</script>

<div class="container">
	<h1>Remote Functions Demo</h1>
	<p>This page demonstrates SvelteKit's Remote Functions feature (.remote.ts files).</p>

	<section>
		<h2>Query Functions</h2>
		<p>Query functions fetch data from the server and can be awaited in templates.</p>

		<div class="demo-box">
			<h3>Simple Query - getServerData()</h3>
			<p>This data is fetched from the server using a remote function:</p>
			<pre>{JSON.stringify(await serverData, null, 2)}</pre>
		</div>

		<div class="demo-box">
			<h3>Parameterized Query - getRecord(id)</h3>
			<label>
				Record ID:
				<input type="text" bind:value={recordId} />
			</label>
			<p>Fetching record with ID: <code>{recordId}</code></p>
			<pre>{JSON.stringify(await getRecord({ id: recordId }), null, 2)}</pre>
		</div>

		<div class="demo-box">
			<h3>Data Processing - processText(text)</h3>
			<label>
				Text to process:
				<input type="text" bind:value={textToProcess} />
			</label>
			<pre>{JSON.stringify(await processText({ text: textToProcess }), null, 2)}</pre>
		</div>
	</section>

	<section>
		<h2>Form Functions</h2>
		<p>Form functions handle form submissions with progressive enhancement.</p>

		<div class="demo-box">
			<h3>Form Submission - submitData()</h3>
			<form {...submitData}>
				<label>
					Enter text:
					<input type="text" name="text" required />
				</label>
				<button type="submit">Submit</button>
			</form>
			<p class="hint">This form works with and without JavaScript!</p>
		</div>
	</section>

	<section>
		<h2>Command Functions</h2>
		<p>Command functions execute actions without returning data.</p>

		<div class="demo-box">
			<h3>Log Activity - logActivity()</h3>
			<label>
				Activity to log:
				<input type="text" bind:value={activityLog} />
			</label>
			<button onclick={() => logActivity({ activity: activityLog })}>
				Log Activity (check server console)
			</button>
		</div>
	</section>

	<section>
		<h2>More Examples</h2>
		<p>
			Check out the <a href="/todos">Todos Demo</a> for a full CRUD example with remote functions.
		</p>
	</section>
</div>

<style>
	.container {
		max-width: 900px;
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
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #ff3e00;
		padding-bottom: 0.5rem;
	}

	h3 {
		color: #666;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}

	section {
		margin: 2rem 0;
	}

	.demo-box {
		background: #f8f8f8;
		padding: 1.5rem;
		margin: 1.5rem 0;
		border-radius: 8px;
		border-left: 4px solid #ff3e00;
	}

	pre {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-top: 0.75rem;
		font-size: 0.9rem;
	}

	label {
		display: block;
		margin: 0.75rem 0;
		color: #555;
		font-weight: 500;
	}

	input[type='text'] {
		display: block;
		width: 100%;
		max-width: 400px;
		padding: 0.5rem;
		border: 2px solid #ddd;
		border-radius: 4px;
		margin-top: 0.25rem;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input[type='text']:focus {
		outline: none;
		border-color: #ff3e00;
	}

	button {
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.6rem 1.2rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		margin-top: 0.5rem;
		transition: background 0.2s;
	}

	button:hover {
		background: #cc3200;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	code {
		background: #f0f0f0;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		color: #d63384;
		font-size: 0.9em;
	}

	p {
		color: #666;
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	.hint {
		font-style: italic;
		color: #999;
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	a {
		color: #ff3e00;
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
