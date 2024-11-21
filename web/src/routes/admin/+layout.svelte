<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import ErrorMessage from '$lib/components/messages/ErrorMessage.svelte';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Permissions } from '$lib/model/permission';
	import type { UserDto } from '$lib/model/user';
	import { getUser } from '$lib/stores/user';
	import { faFile, faGears, faUsers, faShield } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/motion';

	onMount(() => {
		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;

			if (user === null) {
				goto('/');
			}

			if (user) {
				if (
					!user.permissions.includes(Permissions.ViewApplication) &&
					!user.permissions.includes(Permissions.Admin) &&
					!user.permissions.includes(Permissions.ManageSettings)
				) {
					status_code = 403;
					error_message = 'You do not have permission to access this page';
				}
			}
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});

	let user: UserDto | undefined | null = undefined;

	let error_message = '';
	let status_code = 0;
</script>

<Header variant="full" />
<div class="flex w-full h-full min-h-screen pt-[88px]">
	{#if error_message}
		<div class="flex items-center justify-center w-full">
			<ErrorMessage status={status_code} message={error_message} />
		</div>
	{:else if user === undefined}
		<div class="flex items-center justify-center w-full">
			<LoadingMessage message={'Loading'} />
		</div>
	{:else if user}
		<Sidebar.Root>
			{#if user.permissions.includes(Permissions.ViewApplication) || user.permissions.includes(Permissions.Admin)}
				<Sidebar.Item href="/admin/applications" icon={faFile} text="Applications" />
				<Sidebar.Item href="/admin/users" icon={faUsers} text="Users" />
				<Sidebar.Item href="/admin/roles" icon={faShield} text="Roles" />
			{/if}
			{#if user.permissions.includes(Permissions.ManageSettings) || user.permissions.includes(Permissions.Admin)}
				<Sidebar.Item href="/admin/settings" icon={faGears} text="Settings" />
			{/if}
		</Sidebar.Root>
		<slot />
	{/if}
</div>
