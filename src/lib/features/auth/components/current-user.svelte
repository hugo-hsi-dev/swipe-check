<script lang="ts">
	import { getValidatedUser } from '../remotes/getValidatedUser.remote';
</script>

<div>{(await getValidatedUser()).name}</div>
