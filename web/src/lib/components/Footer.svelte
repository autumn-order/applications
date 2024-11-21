<script lang="ts">
	import Fa from 'svelte-fa';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';

	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	import { DISCORD_LINK } from '../../constants';
</script>

<footer class="primary-bg border-color flex justify-center w-screen h-48 border-t">
	<div class="container flex justify-between flex-wrap h-full pt-8 pb-10">
		<div class="flex items-center">
			<a href="/" class="flex items-center gap-4">
				<div>
					<enhanced:img
						src="/static/logo512black.png"
						class="w-16 h-16 block dark:hidden"
						alt="site logo"
					/>
					<enhanced:img
						src="/static/logo512white.png"
						class="w-16 h-16 hidden dark:block"
						alt="site logo"
					/>
				</div>
				<h1 class="text-lg sm:text-2xl lg:text-4xl font-bold">Autumn</h1>
			</a>
		</div>
		<ul class="flex gap-2 items-center">
			<li>
				<ThemeSwitch />
			</li>
			<li>
				<a href={DISCORD_LINK} target="_blank" aria-label="Discord">
					<Button class="flex gap-2" variant="outline" aria-label="Discord">
						<Fa icon={faDiscord} size="lg" />
						Autumn Discord
					</Button>
				</a>
			</li>
		</ul>
	</div>
</footer>
