import { query, form } from '$app/server';

// In-memory storage (in a real app, use a database)
interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: string;
}

let todos: Todo[] = [
	{
		id: '1',
		text: 'Learn SvelteKit remote functions',
		completed: false,
		createdAt: new Date().toISOString()
	},
	{
		id: '2',
		text: 'Build an awesome app',
		completed: false,
		createdAt: new Date().toISOString()
	}
];

/**
 * Query function - get all todos
 */
export const getTodos = query(async () => {
	return todos;
});

/**
 * Query function - get a single todo by ID
 */
export const getTodo = query(async (id: string) => {
	const todo = todos.find(t => t.id === id);
	if (!todo) {
		throw new Error(`Todo with id ${id} not found`);
	}
	return todo;
});

/**
 * Form function - add a new todo
 */
export const addTodo = form(async (data: FormData) => {
	const text = data.get('text') as string;

	if (!text || text.trim().length === 0) {
		return {
			success: false,
			error: 'Todo text is required'
		};
	}

	const newTodo: Todo = {
		id: Date.now().toString(),
		text: text.trim(),
		completed: false,
		createdAt: new Date().toISOString()
	};

	todos.push(newTodo);

	return {
		success: true,
		todo: newTodo
	};
});

/**
 * Form function - toggle todo completion status
 */
export const toggleTodo = form(async (data: FormData) => {
	const id = data.get('id') as string;

	const todo = todos.find(t => t.id === id);
	if (!todo) {
		return {
			success: false,
			error: 'Todo not found'
		};
	}

	todo.completed = !todo.completed;

	return {
		success: true,
		todo
	};
});

/**
 * Form function - delete a todo
 */
export const deleteTodo = form(async (data: FormData) => {
	const id = data.get('id') as string;

	const index = todos.findIndex(t => t.id === id);
	if (index === -1) {
		return {
			success: false,
			error: 'Todo not found'
		};
	}

	const deleted = todos.splice(index, 1)[0];

	return {
		success: true,
		todo: deleted
	};
});
