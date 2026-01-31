<script>
	import { getUser } from '../../remotes/getUser/getUser.remote';
</script>

<div>{await getUser()}</div>
