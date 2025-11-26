<script lang="ts">
  import { authClient } from '$lib/auth-client';

  let name = '';
  let email = '';
  let password = '';
  let error = '';

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    const { error: err } = await authClient.signUp.email({ name, email, password }, {
      onError(ctx) { error = ctx.error.message; },
      onSuccess() { location.href = '/dashboard'; }
    });
    if (err) error = err.message;
  }
</script>

<h1>Sign Up</h1>
<form on:submit={submit}>
  <label>
    Name
    <input type="text" bind:value={name} required />
  </label>
  <label>
    Email
    <input type="email" bind:value={email} required />
  </label>
  <label>
    Password
    <input type="password" bind:value={password} required />
  </label>
  {#if error}<p style="color:red">{error}</p>{/if}
  <button type="submit">Create Account</button>
</form>
<p><a href="/auth/sign-in">Have an account? Sign in</a></p>

