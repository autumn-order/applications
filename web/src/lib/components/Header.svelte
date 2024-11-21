<script lang="ts">
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import Fa from 'svelte-fa';
	import { DISCORD_LINK } from '../../constants';
	import { Button } from './ui/button';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import type { UserDto } from '$lib/model/user';
	import { onDestroy, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import type { Unsubscriber } from 'svelte/store';
	import { getUser, logout } from '$lib/stores/user';
	import {
		faAngleDown,
		faBars,
		faEnvelope,
		faRightFromBracket,
		faUserTie
	} from '@fortawesome/free-solid-svg-icons';
	import { Permissions } from '$lib/model/permission';

	function toggleUserDropdown() {
		userDropdownOpen = !userDropdownOpen;
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
		if (dropdownOpen) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
		}
	}

	function handleScreenSizeChange(event: MediaQueryListEvent) {
		if (event.matches) {
			document.body.classList.remove('overflow-hidden');
			dropdownOpen = false;
		}
	}

	function handleLogout() {
		userDropdownOpen = false;
		dropdownOpen = !dropdownOpen;
		document.body.classList.remove('overflow-hidden');
		logout();
	}

	function handleClickOutside(event: any) {
		if (userDropdown && !userDropdown.contains(event.target)) {
			userDropdownOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		const mediaQuery = window.matchMedia('(min-width: 1024px)');
		mediaQuery.addEventListener('change', handleScreenSizeChange);

		if (mediaQuery.matches) {
			document.body.classList.remove('overflow-hidden');
		}

		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});

	afterNavigate(() => {
		dropdownOpen = false;
		document.body.classList.remove('overflow-hidden');
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	let user: undefined | null | UserDto = undefined;

	let dropdownOpen = false;
	let userDropdown: HTMLLIElement | HTMLDivElement;
	let userDropdownOpen = false;

	export let variant: 'default' | 'full' = 'default';
</script>

<header class="primary-bg border-color fixed w-screen border-b flex flex-col items-center z-20">
	<div
		class="{variant === 'full'
			? ''
			: 'max-w-[1440px]'} px-6 py-3 flex justify-between items-center w-full"
	>
		<ul>
			<li>
				<a href="/" class="flex items-center gap-2">
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
			</li>
		</ul>
		<ul class="hidden lg:flex items-center gap-2">
			<li>
				<ThemeSwitch />
			</li>
			<li>
				<a href={DISCORD_LINK} target="_blank">
					<Button class="flex gap-2" variant="outline" aria-label="Discord">
						<Fa icon={faDiscord} size="lg" />
						Autumn Discord
					</Button>
				</a>
			</li>
			{#if user}
				<li bind:this={userDropdown} class="relative">
					<button class="text-hover flex gap-2 items-center" on:click={() => toggleUserDropdown()}>
						<img
							class="w-12 h-12 rounded-full"
							src="https://images.evetech.net/characters/{user.character_id}/portrait?size=64"
							alt="{user.character_name} avatar"
						/>
						<p class="font-bold">{user.character_name}</p>
						<Fa icon={faAngleDown} />
					</button>
					{#if userDropdownOpen}
						<ul
							class="primary-bg border-color right-0 absolute mt-[20px] flex flex-col border w-52 rounded-b-sm"
						>
							<li>
								<a
									href="/application"
									class="text-hover flex gap-2 items-center w-full p-2 pb-0"
									on:click={() => (userDropdownOpen = false)}
								>
									<Fa icon={faEnvelope} />
									<p class="mb-1">Application</p>
								</a>
							</li>
							{#if user.permissions.includes(Permissions.Admin) || user.permissions.includes(Permissions.ViewApplication)}
								<li>
									<a
										href="/admin"
										class="text-hover flex gap-2 items-center w-full p-2 pb-0"
										on:click={() => (userDropdownOpen = false)}
									>
										<Fa icon={faUserTie} />
										<p class="mb-1">Admin</p>
									</a>
								</li>
							{/if}
							<li>
								<button
									class="text-hover flex gap-2 items-center w-full p-2"
									on:click={() => handleLogout()}
								>
									<Fa icon={faRightFromBracket} />
									<p class="mb-1">Log Out</p>
								</button>
							</li>
						</ul>
					{/if}
				</li>
			{/if}
		</ul>
		<div class="flex lg:hidden">
			<Button
				variant="outline"
				size="icon"
				on:click={() => toggleDropdown()}
				aria-label="header dropdown"
			>
				<Fa icon={faBars} size="lg" />
			</Button>
		</div>
	</div>
	{#if dropdownOpen}
		<div class="flex lg:hidden flex-col gap-2 w-full h-screen border-t px-6 py-4">
			{#if user}
				<div class="text-hover flex gap-2 items-center">
					<img
						class="w-12 h-12 rounded-full"
						src="https://images.evetech.net/characters/{user.character_id}/portrait?size=64"
						alt="{user.character_name} avatar"
					/>
					<p class="font-bold">{user.character_name}</p>
				</div>
				<ul>
					<li>
						<a
							href="/application"
							class="border-color border-b text-hover flex gap-2 items-center w-full p-2"
							on:click={() => (userDropdownOpen = false)}
						>
							<Fa icon={faEnvelope} />
							<p class="mb-1">Application</p>
						</a>
					</li>
					{#if user.permissions.includes(Permissions.Admin) || user.permissions.includes(Permissions.ViewApplication)}
						<li>
							<a
								href="/admin"
								class="border-color border-b text-hover flex gap-2 items-center w-full p-2"
								on:click={() => (userDropdownOpen = false)}
							>
								<Fa icon={faUserTie} />
								<p class="mb-1">Admin</p>
							</a>
						</li>
					{/if}
					<li>
						<button
							class="border-color border-b text-hover flex gap-2 items-center w-full p-2"
							on:click={() => handleLogout()}
						>
							<Fa icon={faRightFromBracket} />
							<p class="mb-1">Log Out</p>
						</button>
					</li>
				</ul>
			{/if}
			<ul class="flex justify-center gap-2">
				<li>
					<ThemeSwitch />
				</li>
				<li>
					<a href={DISCORD_LINK} target="_blank">
						<Button class="flex gap-2" variant="outline" aria-label="Discord">
							<Fa icon={faDiscord} size="lg" />
							Autumn Discord
						</Button>
					</a>
				</li>
			</ul>
		</div>
	{/if}
</header>
