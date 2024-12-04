<script lang="ts">
	import { setDiscordComplete } from '$lib/stores/application';
	import { Button } from '$lib/components/ui/button';
	import type { ApplicationDto } from '$lib/model/application';
	import { DISCORD_LINK } from '../../../../constants';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let application: ApplicationDto | null = $$props.application;
	let discord_completed: boolean = !!application?.discord_completed;
	export let setViewedStep: Function;

	if (!application) {
		discord_completed = true;
	}

	async function completeDiscord() {
		discord_completed = await setDiscordComplete();

		if (discord_completed) {
			discord_completed = true;
			setViewedStep(2);
		}
	}
</script>

<div class="flex flex-col flex-grow gap-2 h-full w-full p-2 lg:p-6">
	<h1 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">
		Step 2. Setup Discord
	</h1>
	<div>
		<enhanced:img
			class="block dark:hidden w-80 h-[61px] mx-auto my-4"
			src="/static/images/application/discord-logo-black.png?w=320&h=61"
			alt="SeAT logo"
		/>
		<enhanced:img
			class="hidden dark:block w-80 h-[61px] mx-auto my-4"
			src="/static/images/application/discord-logo-white.png?w=320&h=61"
			alt="SeAT logo"
		/>
	</div>
	<div class="w-full flex flex-wrap">
		<div class="flex flex-col gap-2 w-full lg:w-1/2">
			<h2 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">
				What is Discord?
			</h2>
			<p>
				Discord is an application commonly used for organizing commmunities, Discord is heavily used
				in gaming communities because it offers text chat & voice chat with a modern & easy to use
				UI. Discord also offers a desktop & mobile application to allow easy communication even away
				from EVE.
			</p>
			<p>
				In EVE Online we use Discord to communicate upcoming events, provide corporation updates,
				and notify members of upcoming fleets. We also have additional channels for common interests
				like Exploration, Industry, Planetary Interaction, etc so you can easily interact with
				people that have shared interests.
			</p>
			<div class="border-color border rounded-md shadow-md my-1 w-fit h-fit self-center">
				<enhanced:img
					class="max-w-[693px] max-h-[390px] w-full rounded-md"
					src="/static/images/application/discord-example.png?w=693&h=390"
					alt="Discord example server"
				/>
			</div>
			<div class="border-color border rounded-md shadow-md my-1 w-fit h-fit self-center">
				<enhanced:img
					class="max-w-[693px] max-h-[390px] w-full rounded-md"
					src="/static/images/application/discord-example2.png?w=693&h=390"
					alt="Discord example server"
				/>
			</div>
		</div>
		<div class="flex flex-col gap-2 w-full lg:w-1/2 pb-4">
			<h2 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">
				How to Setup Discord
			</h2>
			<ul class="lg:px-12 flex flex-col gap-2">
				<li>
					1. If you are already in the Autumn Discord leave it and join it via the Discord connector
					going forward.
				</li>
				<li>
					2. Go to <a class="link-color" href="https://seat.autumn-order.com" target="_blank"
						>https://seat.autumn-order.com</a
					>
					and click <b>LOG IN with EVE Online</b> if you aren't signed in already.
				</li>
				<li>
					<p>
						3. Go to the <a
							class="link-color"
							href="https://seat.autumn-order.com/seat-connector/identities"
							target="_blank">connectors tab on the left sidebar</a
						>
						and click <b>Join Server</b> under Discord.
					</p>
					<div class="border-color border rounded-md shadow-md my-2 w-fit h-fit">
						<enhanced:img
							class="max-w-[597px] max-h-[336px] w-full rounded-md"
							src="/static/images/application/seat-discord-connector.png?w=597&h=336"
							alt="EVE login page"
						/>
					</div>
				</li>
				<li>
					<p>
						4. This will take you to Discord's website where you will login or create an account.
					</p>
					<div class="border-color border rounded-md shadow-md my-2 w-fit h-fit">
						<enhanced:img
							class="max-w-[597px] max-h-[336px] w-full rounded-md"
							src="/static/images/application/discord-login.png?w=597&h=336"
							alt="EVE login page"
						/>
					</div>
				</li>
				<li>
					5. Once you are done click the <b>Complete Discord Setup</b> button below to mark the Discord
					setup process as completed.
				</li>
				<li>
					Please note that linking Discord to SeAT is required for your application to be accepted
					and for you to recieve member roles. Reach out to us via <a
						class="link-color"
						href={DISCORD_LINK}>Discord</a
					> if you have any trouble!
				</li>
			</ul>
		</div>
		<ul class="flex flex-wrap justify-center py-4 pt-8 w-full gap-2">
			<li>
				<a href={DISCORD_LINK} target="_blank">
					<Button class="flex gap-2" variant="outline">
						<Fa icon={faDiscord} size="lg" />
						<p>Trouble setting up Discord? Ask us for assistance!</p>
					</Button>
				</a>
			</li>
			<li>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} disabled={discord_completed} class="flex gap-2">
							<Fa icon={faCheck} />
							<p>Complete Discord Setup</p>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item on:click={() => completeDiscord()} class="cursor-pointer"
							>Confirm Discord setup completed.</DropdownMenu.Item
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</li>
		</ul>
		{#if discord_completed}
			<div class="flex flex-col gap-2 w-full">
				<p class="text-center">Discord setup complete! You can now move on to the next step.</p>
			</div>
		{/if}
		<ul class="flex w-full justify-between gap-2 pt-6">
			<li>
				<Button class="flex gap-2 items-center" variant="outline" on:click={() => setViewedStep(0)}>
					<Fa icon={faArrowLeft} />
					<p>Previous Step</p>
				</Button>
			</li>
			<li>
				<Button
					class="flex gap-2 items-center"
					variant="outline"
					disabled={!discord_completed}
					on:click={() => setViewedStep(2)}
				>
					<p>Next Step</p>
					<Fa icon={faArrowRight} />
				</Button>
			</li>
		</ul>
	</div>
</div>
