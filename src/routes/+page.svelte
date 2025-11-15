<div class="container">
	<h1>Welcome to Swipe Check</h1>
	<p>A SvelteKit application with remote functions enabled.</p>

	<section>
		<h2>Features</h2>
		<ul>
			<li>Server-side API endpoints</li>
			<li>Server-side data loading</li>
			<li>Server-only utility functions</li>
			<li>RESTful API routes</li>
		</ul>
	</section>

	<section>
		<h2>Try It Out</h2>
		<p>Visit the <a href="/demo">demo page</a> to see remote functions in action.</p>
	</section>

	<section>
		<h2>API Endpoints</h2>
		<ul>
			<li><code>GET /api/hello</code> - Simple hello world endpoint</li>
			<li><code>GET /api/data</code> - Fetch server data</li>
			<li><code>POST /api/data</code> - Process data on server</li>
			<li><code>GET /api/records/[id]</code> - Fetch record by ID</li>
		</ul>
	</section>

	<section>
		<h2>Resources</h2>
		<ul>
			<li><a href="https://svelte.dev/docs/kit">SvelteKit Documentation</a></li>
			<li><a href="https://svelte.dev/docs/kit/routing#server">SvelteKit Server Routes</a></li>
			<li><a href="https://svelte.dev/docs/kit/load#page-data">Server Load Functions</a></li>
		</ul>
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
		margin-bottom: 0.5rem;
	}

	h2 {
		color: #333;
		margin-top: 2rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #ff3e00;
		padding-bottom: 0.5rem;
	}

	section {
		margin: 2rem 0;
	}

	ul {
		line-height: 1.8;
	}

	li {
		color: #666;
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
		color: #333;
	}

	p {
		color: #666;
		line-height: 1.6;
	}
</style>
