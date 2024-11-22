<script lang="ts">
	import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public';
	import Header from '$lib/components/Header.svelte';

	import type { UserDto } from '$lib/model/user';
	import { getUser } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/motion';
	import { goto } from '$app/navigation';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';

	let user: undefined | null | UserDto = undefined;

	onMount(() => {
		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;

			if (user) {
				goto('/application');
			}
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});
</script>

<svelte:head>
	<title>Apply to Autumn</title>
	<meta
		name="description"
		content="Your journey with Autumn begins here! Begin your journey in nullsec with The Order of Autumn, a corporation part of Black Rose alliance & Phoenix Coalition, or in highsec with Autumn Highsec Division."
	/>
</svelte:head>

<Header />
<div class="flex justify-center h-full min-h-screen pt-[88px]">
	<section class="border-color flex w-full max-w-[1440px] border-x">
		{#if user === undefined || user !== null}
			<LoadingMessage message={'Loading'} />
		{:else}
			<div
				class="h-full w-full flex flex-col items-center gap-2 justify-center p-2 lg:p-6 pb-[88px]"
			>
				<div>
					<enhanced:img
						src="/static/logo512black.png?w=256&h=256"
						class="w-64 h-64 block dark:hidden"
						alt="site logo"
					/>
					<enhanced:img
						src="/static/logo512white.png?w=256&h=256"
						class="w-64 h-64 hidden dark:block"
						alt="site logo"
					/>
				</div>
				<h1 class="text-gradient text-3xl font-bold">Autumn Applications</h1>
				<h2 class="text-gradient text-xl font-bold">Begin or continue your application</h2>
				<div>
					<a href="{PUBLIC_VITE_BACKEND_URL}/auth/login">
						<enhanced:img
							src="/static/images/sso/eve-sso-login-white-large.png"
							class="w-[270px] h-[45px] block dark:hidden"
							alt="Log in with EVE Online"
						/>
						<enhanced:img
							src="/static/images/sso/eve-sso-login-black-large.png"
							class="w-[270px] h-[45px] hidden dark:block"
							alt="Log in with EVE Online"
						/>
					</a>
				</div>
			</div>
		{/if}
	</section>
</div>
