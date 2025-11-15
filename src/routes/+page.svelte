<div class="container">
	<h1>Welcome to Swipe Check</h1>
	<p>A SvelteKit application with Remote Functions enabled.</p>

	<section>
		<h2>What are Remote Functions?</h2>
		<p>
			Remote Functions are a powerful SvelteKit feature that allows you to write server-only logic
			in <code>.remote.ts</code> files and call them from your Svelte components as if they were
			regular functions.
		</p>
		<p>
			On the server, they execute directly. On the client, they automatically become wrappers around
			<code>fetch</code> calls.
		</p>
	</section>

	<section>
		<h2>Features</h2>
		<ul>
			<li><strong>Type-Safe:</strong> Full TypeScript support with end-to-end type safety</li>
			<li><strong>Secure:</strong> Server-only code that never gets exposed to the client</li>
			<li><strong>Simple:</strong> Call server functions like regular functions</li>
			<li>
				<strong>Progressive Enhancement:</strong> Forms work with and without JavaScript
			</li>
		</ul>
	</section>

	<section>
		<h2>Function Types</h2>
		<div class="function-types">
			<div class="type-card">
				<h3>query()</h3>
				<p>Fetch data from the server. Can be awaited in templates.</p>
				<code>export const getData = query(async () => ...)</code>
			</div>
			<div class="type-card">
				<h3>form()</h3>
				<p>Handle form submissions with progressive enhancement.</p>
				<code>export const submit = form(async (data) => ...)</code>
			</div>
			<div class="type-card">
				<h3>command()</h3>
				<p>Execute actions without returning data.</p>
				<code>export const log = command(async (msg) => ...)</code>
			</div>
		</div>
	</section>

	<section>
		<h2>Try It Out</h2>
		<div class="demo-links">
			<a href="/demo" class="demo-link">
				<h3>Remote Functions Demo</h3>
				<p>Explore query, form, and command functions with interactive examples.</p>
			</a>
			<a href="/todos" class="demo-link">
				<h3>Todos CRUD Demo</h3>
				<p>See a complete CRUD application built with remote functions.</p>
			</a>
		</div>
	</section>

	<section>
		<h2>Remote Function Files</h2>
		<ul>
			<li><code>src/routes/data.remote.ts</code> - General remote functions</li>
			<li><code>src/routes/todos.remote.ts</code> - Todo CRUD operations</li>
		</ul>
	</section>

	<section>
		<h2>Resources</h2>
		<ul>
			<li><a href="/REMOTE_FUNCTIONS.md">Remote Functions Documentation</a></li>
			<li>
				<a href="https://svelte.dev/docs/kit/remote-functions" target="_blank">
					Official SvelteKit Docs
				</a>
			</li>
			<li>
				<a href="https://github.com/sveltejs/kit/discussions/13897" target="_blank">
					GitHub Discussion
				</a>
			</li>
		</ul>
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
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
	}

	h2 {
		color: #333;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #ff3e00;
		padding-bottom: 0.5rem;
	}

	h3 {
		color: #ff3e00;
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
	}

	section {
		margin: 2rem 0;
	}

	ul {
		line-height: 2;
		padding-left: 1.5rem;
	}

	li {
		color: #555;
	}

	li strong {
		color: #333;
	}

	.function-types {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.type-card {
		background: #f8f8f8;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid #ff3e00;
	}

	.type-card h3 {
		margin-top: 0;
	}

	.type-card p {
		margin: 0.75rem 0;
		color: #666;
	}

	.type-card code {
		display: block;
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
		overflow-x: auto;
		margin-top: 0.75rem;
	}

	.demo-links {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.demo-link {
		display: block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 2rem;
		border-radius: 8px;
		text-decoration: none;
		transition: transform 0.2s, box-shadow 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.demo-link:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.demo-link h3 {
		color: white;
		margin: 0 0 0.75rem 0;
	}

	.demo-link p {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		line-height: 1.5;
	}

	a {
		color: #ff3e00;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	code {
		background: #f5f5f5;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		color: #d63384;
		font-size: 0.9em;
	}

	p {
		color: #666;
		line-height: 1.7;
		margin: 0.5rem 0;
	}

	@media (max-width: 640px) {
		.function-types,
		.demo-links {
			grid-template-columns: 1fr;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>
