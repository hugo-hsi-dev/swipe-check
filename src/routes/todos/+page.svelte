<script lang="ts">
	import { getTodos, addTodo, toggleTodo, deleteTodo } from '../todos.remote';

	// Reactive todos list
	let todosPromise = $derived(getTodos());
</script>

<div class="container">
	<h1>Todos - Remote Functions CRUD Demo</h1>
	<p>A complete CRUD example using SvelteKit Remote Functions</p>

	<section>
		<h2>Add New Todo</h2>
		<form {...addTodo}>
			<input type="text" name="text" placeholder="Enter a new todo..." required />
			<button type="submit">Add Todo</button>
		</form>
		<p class="hint">Forms work with progressive enhancement (try disabling JavaScript!)</p>
	</section>

	<section>
		<h2>Todo List</h2>
		{#await todosPromise}
			<p class="loading">Loading todos...</p>
		{:then todos}
			{#if todos.length === 0}
				<p class="empty">No todos yet. Add one above!</p>
			{:else}
				<ul class="todo-list">
					{#each todos as todo (todo.id)}
						<li class="todo-item" class:completed={todo.completed}>
							<div class="todo-content">
								<form {...toggleTodo} class="toggle-form">
									<input type="hidden" name="id" value={todo.id} />
									<button type="submit" class="toggle-btn" aria-label="Toggle todo">
										{#if todo.completed}
											<span class="checkbox checked">✓</span>
										{:else}
											<span class="checkbox"></span>
										{/if}
									</button>
								</form>
								<span class="todo-text">{todo.text}</span>
							</div>
							<form {...deleteTodo} class="delete-form">
								<input type="hidden" name="id" value={todo.id} />
								<button type="submit" class="delete-btn" aria-label="Delete todo">×</button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		{:catch error}
			<p class="error">Error loading todos: {error.message}</p>
		{/await}
	</section>

	<section class="info">
		<h3>About This Demo</h3>
		<p>
			This todo list demonstrates all CRUD operations using SvelteKit Remote Functions:
		</p>
		<ul>
			<li><strong>Create:</strong> <code>addTodo</code> - Add new todos via form</li>
			<li><strong>Read:</strong> <code>getTodos</code> - Fetch all todos</li>
			<li><strong>Update:</strong> <code>toggleTodo</code> - Toggle completion status</li>
			<li><strong>Delete:</strong> <code>deleteTodo</code> - Remove todos</li>
		</ul>
		<p>All operations work with JavaScript disabled (progressive enhancement)!</p>
		<p><a href="/demo">← Back to Remote Functions Demo</a></p>
	</section>
</div>

<style>
	.container {
		max-width: 700px;
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

	h3 {
		color: #666;
		margin-bottom: 0.75rem;
	}

	section {
		margin: 2rem 0;
	}

	form {
		display: flex;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	input[type='text'] {
		flex: 1;
		padding: 0.75rem;
		border: 2px solid #ddd;
		border-radius: 4px;
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
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}

	button:hover {
		background: #cc3200;
	}

	.todo-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0;
	}

	.todo-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		margin: 0.5rem 0;
		background: #f8f8f8;
		border-radius: 6px;
		border-left: 4px solid #ff3e00;
		transition: all 0.2s;
	}

	.todo-item:hover {
		background: #f0f0f0;
	}

	.todo-item.completed {
		opacity: 0.6;
		border-left-color: #999;
	}

	.todo-item.completed .todo-text {
		text-decoration: line-through;
		color: #999;
	}

	.todo-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.toggle-form,
	.delete-form {
		margin: 0;
	}

	.toggle-btn,
	.delete-btn {
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.checkbox {
		display: inline-block;
		width: 24px;
		height: 24px;
		border: 2px solid #ddd;
		border-radius: 4px;
		text-align: center;
		line-height: 20px;
		transition: all 0.2s;
	}

	.checkbox.checked {
		background: #ff3e00;
		border-color: #ff3e00;
		color: white;
	}

	.toggle-btn:hover .checkbox {
		border-color: #ff3e00;
	}

	.todo-text {
		font-size: 1rem;
		color: #333;
	}

	.delete-btn {
		font-size: 1.5rem;
		color: #999;
		width: 30px;
		height: 30px;
		line-height: 30px;
		text-align: center;
		transition: color 0.2s;
	}

	.delete-btn:hover {
		color: #ff3e00;
		background: transparent;
	}

	.loading,
	.empty,
	.error {
		text-align: center;
		padding: 2rem;
		color: #666;
		font-style: italic;
	}

	.error {
		color: #d63384;
		background: #ffe6f0;
		border-radius: 4px;
	}

	.hint {
		font-style: italic;
		color: #999;
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	.info {
		background: #f0f7ff;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid #0066cc;
		margin-top: 3rem;
	}

	.info ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
		line-height: 1.8;
	}

	.info li {
		color: #555;
	}

	code {
		background: #e0e0e0;
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

	a {
		color: #0066cc;
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
