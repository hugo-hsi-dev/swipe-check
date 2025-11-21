import { query, form } from '$app/server';
import { z } from 'zod';

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
const getTodoSchema = z.object({
	id: z.string()
});

export const getTodo = query(getTodoSchema, async ({ id }) => {
	const todo = todos.find((t) => t.id === id);
	if (!todo) {
		throw new Error(`Todo with id ${id} not found`);
	}
	return todo;
});

/**
 * Form function - add a new todo
 */
const addTodoSchema = z.object({
	text: z.string().min(1, 'Todo text is required').trim()
});

export const addTodo = form(addTodoSchema, async (data) => {
	const newTodo: Todo = {
		id: Date.now().toString(),
		text: data.text,
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
const toggleTodoSchema = z.object({
	id: z.string()
});

export const toggleTodo = form(toggleTodoSchema, async (data) => {
	const todo = todos.find((t) => t.id === data.id);
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
const deleteTodoSchema = z.object({
	id: z.string()
});

export const deleteTodo = form(deleteTodoSchema, async (data) => {
	const index = todos.findIndex((t) => t.id === data.id);
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
