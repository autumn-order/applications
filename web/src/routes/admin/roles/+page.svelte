<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Pagination from '$lib/components/ui/pagination';
	import Table from './data-table.svelte';
	import type { GetSeatRolesDto, SeatRoleFilters } from '$lib/model/seat_role';
	import { onDestroy, onMount } from 'svelte';
	import type { Selected } from 'bits-ui';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';
	import ErrorMessage from '$lib/components/messages/ErrorMessage.svelte';
	import { Permissions } from '$lib/model/permission';
	import type { Unsubscriber } from 'svelte/store';
	import { getUser } from '$lib/stores/user';
	import type { UserDto } from '$lib/model/user';

	import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public';

	async function fetchRoles(
		filters: Partial<SeatRoleFilters>,
		page: number,
		entries_per_page: number
	): Promise<GetSeatRolesDto> {
		let request = `${PUBLIC_VITE_BACKEND_URL}/admin/roles?page=${page}&limit=${entries_per_page}`;

		if (filters.name) {
			request += `&name=${filters.name}`;
		}
		if (filters.id) {
			request += `&id=${filters.id}`;
		}

		try {
			const response = await fetch(request, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				signal: AbortSignal.timeout(5000)
			});

			if (response.ok) {
				const result: GetSeatRolesDto = await response.json();
				loaded = true;

				return result;
			} else {
				error_message = await response.text();
				status_code = response.status;
			}
		} catch (error) {
			error_message = 'Request timed out';
			status_code = 408;
		}

		return {
			roles: [],
			total: 0
		};
	}

	function handleChangeEntriesPerPage(object: Selected<number> | undefined) {
		const entry_count = object?.value;

		if (entry_count) {
			entries_per_page = entry_count;

			(async () => {
				roleData = await fetchRoles(filters, page, entries_per_page);
			})();
		}
	}

	function handleChangePage(new_page: number) {
		if (page === new_page) return;

		page = new_page;

		(async () => {
			roleData = await fetchRoles(filters, page, entries_per_page);
		})();
	}

	const debounce = <T extends (...args: any[]) => void>(
		func: T,
		delay: number
	): ((...args: Parameters<T>) => void) => {
		return (...args: Parameters<T>) => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => func.apply(null, args), delay);
		};
	};

	const handleNameFilter = debounce(async (event: InputEvent) => {
		const target = event.target as HTMLInputElement | null;
		if (target) {
			filters.name = target.value;
			roleData = await fetchRoles(filters, page, entries_per_page);
		}
	}, 300);

	onDestroy(() => {
		clearTimeout(debounceTimeout);
	});

	onMount(() => {
		let unsubscribe: Unsubscriber;

		const userStore = getUser();

		unsubscribe = userStore.subscribe((value) => {
			user = value;

			if (user) {
				if (
					user.permissions.includes(Permissions.ViewApplication) ||
					user.permissions.includes(Permissions.Admin)
				) {
					(async () => {
						roleData = await fetchRoles(filters, page, entries_per_page);
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

	let debounceTimeout: ReturnType<typeof setTimeout>;

	let error_message = '';
	let status_code = 0;
	let loaded = false;

	let page = 1;
	let entries_per_page = 10;
	let roleData: GetSeatRolesDto = { roles: [], total: 0 };
	let filters: Partial<SeatRoleFilters> = {};

	let user: UserDto | undefined | null = undefined;
</script>

<svelte:head>
	<title>Autumn Applications | Roles</title>
</svelte:head>

<section class="flex justify-center w-full">
	{#if error_message}
		<ErrorMessage status={status_code} message={error_message} />
	{:else}
		<Card.Root class="w-full h-fit m-4">
			<Card.Header>
				<Card.Title class="text-2xl">Roles</Card.Title>
			</Card.Header>
			{#if !loaded}
				<Card.Content>
					<LoadingMessage message="Loading roles" />
				</Card.Content>
			{:else}
				<Card.Content class="flex flex-col gap-2">
					<div class="flex gap-2 justify-between flex-wrap">
						<div class="flex gap-2 items-center">
							<p>Show</p>
							<Select.Root onSelectedChange={handleChangeEntriesPerPage}>
								<Select.Trigger class="w-20 h-8">
									<Select.Value placeholder="10" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value={10}>10</Select.Item>
									<Select.Item value={25}>25</Select.Item>
									<Select.Item value={50}>50</Select.Item>
									<Select.Item value={100}>100</Select.Item>
								</Select.Content>
							</Select.Root>
							<p>entries</p>
						</div>
						<div class="flex gap-2 flex-wrap">
							<Input placeholder="Search" class="w-56" on:input={handleNameFilter} />
						</div>
					</div>
					<Table users={roleData.roles} />
				</Card.Content>
				<Card.Footer class="flex justify-between gap-2 flex-wrap">
					<p class="w-1/2">Showing {roleData.roles.length} of {roleData.total} roles</p>
					<div class="w-fit">
						<Pagination.Root
							count={roleData.total}
							perPage={entries_per_page}
							let:pages
							let:currentPage
						>
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton
										on:click={() => handleChangePage((currentPage ?? 1) - 1)}
									/>
								</Pagination.Item>
								{#each pages as page}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link
												{page}
												isActive={(currentPage ?? 1) == page.value}
												on:click={() => handleChangePage(page.value)}
											>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton
										on:click={() => handleChangePage((currentPage ?? 1) + 1)}
									/>
								</Pagination.Item>
							</Pagination.Content>
						</Pagination.Root>
					</div>
				</Card.Footer>
			{/if}
		</Card.Root>
	{/if}
</section>
