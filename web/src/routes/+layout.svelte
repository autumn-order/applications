<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<meta name="og:image" content="/logo512white.png" />
	<meta name="twitter:image" content="/logo512white.png" />
</svelte:head>

<main class="primary-bg h-full min-h-screen min-w-screen">
	<ModeWatcher />
	<slot />
	<Footer />
</main>
