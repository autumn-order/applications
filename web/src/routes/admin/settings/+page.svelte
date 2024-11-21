<script lang="ts">
	import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import TaskTriggers from './task-triggers.svelte';
	import WebhookConfig from './webhook-config.svelte';
	import type { DiscordWebhooksDto } from '$lib/model/settings';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';
	import ErrorMessage from '$lib/components/messages/ErrorMessage.svelte';
	import type { Unsubscriber } from 'svelte/motion';
	import { getUser } from '$lib/stores/user';
	import { Permissions } from '$lib/model/permission';
	import type { UserDto } from '$lib/model/user';

	const initializeWebhooks = (data: Partial<DiscordWebhooksDto>): DiscordWebhooksDto => {
		return {
			discord_webhook_new_application: data.discord_webhook_new_application || '',
			discord_webhook_application_accepted: data.discord_webhook_application_accepted || '',
			discord_webhook_application_rejected: data.discord_webhook_application_rejected || '',
			discord_webhook_applicant_joined: data.discord_webhook_applicant_joined || '',
			discord_webhook_application_expired: data.discord_webhook_application_expired || '',
			discord_webhook_application_ready_for_review:
				data.discord_webhook_application_ready_for_review || ''
		};
	};

	async function getWebhooks() {
		try {
			const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/settings/webhooks`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				signal: AbortSignal.timeout(5000)
			});

			if (response.ok) {
				const result: DiscordWebhooksDto = initializeWebhooks(await response.json());

				saved_webhooks = { ...result };
				webhooks = { ...result };
				loaded = true;
			} else {
				error_message = await response.text();
				status_code = response.status;
			}
		} catch (error) {
			error_message = 'Request timed out';
			status_code = 408;
		}

		return {
			users: [],
			total: 0
		};
	}

	onMount(() => {
		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;

			if (user) {
				if (
					user.permissions.includes(Permissions.ManageSettings) ||
					user.permissions.includes(Permissions.Admin)
				) {
					(async () => {
						await getWebhooks();
					})();
				} else {
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

	let saved_webhooks: DiscordWebhooksDto = {
		discord_webhook_new_application: '',
		discord_webhook_application_accepted: '',
		discord_webhook_application_rejected: '',
		discord_webhook_application_expired: '',
		discord_webhook_application_ready_for_review: '',
		discord_webhook_applicant_joined: ''
	};

	let webhooks: DiscordWebhooksDto = {
		discord_webhook_new_application: '',
		discord_webhook_application_accepted: '',
		discord_webhook_application_rejected: '',
		discord_webhook_application_expired: '',
		discord_webhook_application_ready_for_review: '',
		discord_webhook_applicant_joined: ''
	};

	let error_message = '';
	let status_code = 0;
	let loaded = false;

	let user: UserDto | undefined | null = undefined;
</script>

<svelte:head>
	<title>Autumn Applications | Settings</title>
</svelte:head>

<section class="flex w-full pt-4 md:p-4">
	{#if error_message}
		<ErrorMessage status={status_code} message={error_message} />
	{:else if !loaded}
		<LoadingMessage message={'Loading Settings'} />
	{:else}
		<div class="w-full md:w-1/2 md:pr-2">
			<TaskTriggers />
		</div>
		<div class="w-full md:w-1/2 md:pl-2">
			<WebhookConfig {webhooks} {saved_webhooks} />
		</div>
	{/if}
</section>
