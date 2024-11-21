<script lang="ts">
	import type { UserDto } from '$lib/model/user';
	import { getUser } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/motion';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';
	import { goto } from '$app/navigation';

	import ApplicationSection from '$lib/components/application/ApplicationSection.svelte';

	let user: undefined | null | UserDto = undefined;

	onMount(() => {
		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;

			if (user === null) {
				goto('/');
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

<div class="flex justify-center h-full min-h-screen pt-[88px]">
	<section class="border-color flex w-full max-w-[1440px] xl:border-x">
		{#if user === undefined || user === null}
			<div class="flex items-center justify-center w-full">
				<LoadingMessage message={'Loading'} />
			</div>
		{:else}
			<ApplicationSection {user} />
		{/if}
	</section>
</div>
