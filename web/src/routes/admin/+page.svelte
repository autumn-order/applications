<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/admin/applications');
	});
</script>

<svelte:head>
	<title>Autumn Applications | Admin</title>
</svelte:head>
