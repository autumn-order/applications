<script lang="ts">
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { DISCORD_LINK } from '../../../../constants';
	import { Button } from '../../ui/button';
	import Fa from 'svelte-fa';
	import type { ApplicationDto } from '$lib/model/application';

	let application: ApplicationDto = $$props.application;
	let user = $$props.user;

	let user_name = '';

	let rejection_reason: string =
		'No reason provided, please contact an officer for more information.';

	if (application) {
		if (application.rejection_reason) {
			rejection_reason = application.rejection_reason;
		}
	}

	if (user) {
		user_name = user.character_name;
	}
</script>

<div class="flex flex-col gap-2 justify-center items-center h-full w-full text-center p-2 lg:p-6">
	<h1 class="text-gradient text-xl sm:text-3xl font-bold w-full text-center">
		We're Sorry {user_name}
	</h1>
	<p>Unfortunately your application has been rejected for the following reason:</p>
	<div class="flex flex-col">
		<p class="text-red-500 py-4 pb-6">
			{rejection_reason}
		</p>
		{#if application.reviewer}
			<div>
				<p>Application Reviewed By</p>
				<div class="py-4">
					<a
						class="flex gap-4 items-center hover:invert-[0.075] dark:hover:invert-[0.025]"
						href="https://zkillboard.com/character/{application.reviewer.character_id}/"
					>
						<img
							class="rounded-full w-16 h-16"
							src="https://images.evetech.net/characters/{application.reviewer
								.character_id}/portrait?size=64"
							alt=""
						/>
						<p>{application.reviewer.character_name}</p>
					</a>
				</div>
			</div>
		{/if}
	</div>
	<p>So long as you aren't blacklisted you are more than welcome to apply again after 30 days.</p>
	<p>If you believe this was a mistake please contact us via the Autumn Discord.</p>
	<div class="pt-4">
		<a href={DISCORD_LINK} target="_blank">
			<Button class="flex gap-2" variant="outline">
				<Fa icon={faDiscord} size="lg" />
				<p>Autumn Discord</p>
			</Button>
		</a>
	</div>
</div>
