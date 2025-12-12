```ts
vi.mock(import('../../remotes/*.remote'), () => {
	return {
		"*": vi.fn()
	};
});
```
