<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import Table from '$lib/components/admin/application-table';
	import Input from '$lib/components/ui/input/input.svelte';
	import LoadingMessage from '$lib/components/messages/LoadingMessage.svelte';
	import ErrorMessage from '$lib/components/messages/ErrorMessage.svelte';

	import { onDestroy, onMount } from 'svelte';
	import type { Selected } from 'bits-ui';
	import {
		ApplicationLocation,
		ApplicationStatus,
		type ApplicationFilters,
		type GetApplicationsDto
	} from '$lib/model/application';
	import { Permissions } from '$lib/model/permission';
	import type { Unsubscriber } from 'svelte/store';
	import { getUser } from '$lib/stores/user';
	import type { UserDto } from '$lib/model/user';
	import { APPLICATION_FILTERS } from '$lib/stores/admin-application-filters';

	import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public';

	async function fetchApplications(
		filters: Partial<ApplicationFilters>,
		page: number,
		entries_per_page: number
	): Promise<GetApplicationsDto> {
		let request = `${PUBLIC_VITE_BACKEND_URL}/admin/applications?page=${page}&limit=${entries_per_page}`;

		if (filters.status) {
			request += `&status=${filters.status}`;
		}
		if (filters.location) {
			request += `&location=${filters.location}`;
		}
		if (filters.discord_completed != null) {
			request += `&discord_completed=${filters.discord_completed}`;
		}
		if (filters.seat_completed != null) {
			request += `&seat_completed=${filters.seat_completed}`;
		}
		if (filters.character) {
			request += `&character=${filters.character}`;
		}
		if (filters.user_id) {
			request += `&user=${filters.user_id}`;
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

			if (!response.ok) {
				error_message = await response.text();
				status_code = response.status;
			} else {
				const result: GetApplicationsDto = await response.json();
				loaded = true;

				return result;
			}
		} catch (error) {
			error_message = 'Request timed out';
			status_code = 408;
		}

		return {
			applications: [],
			total: 0
		};
	}

	function handleChangeEntriesPerPage(object: Selected<number> | undefined) {
		const entry_count = object?.value;

		if (entry_count) {
			entries_per_page = entry_count;

			(async () => {
				applicationData = await fetchApplications(filters, page, entries_per_page);
			})();
		}
	}

	function handleChangePage(new_page: number) {
		if (page === new_page) return;

		page = new_page;

		(async () => {
			applicationData = await fetchApplications(filters, page, entries_per_page);
		})();
	}

	async function handleStatusFilter(object: Selected<ApplicationStatus | undefined> | undefined) {
		const status = object?.value;

		if (status) {
			filters.status = status;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		} else {
			filters.status = undefined;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		}

		APPLICATION_FILTERS.set(filters as ApplicationFilters);
	}

	async function handleLocationFilter(
		object: Selected<ApplicationLocation | undefined> | undefined
	) {
		const location = object?.value;

		if (location) {
			filters.location = location;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		} else {
			filters.location = undefined;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		}

		APPLICATION_FILTERS.set(filters as ApplicationFilters);
	}

	async function handleDiscordFilter(object: Selected<boolean | undefined> | undefined) {
		const discord = object?.value;

		if (discord !== undefined) {
			filters.discord_completed = discord;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		} else {
			filters.discord_completed = undefined;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		}

		APPLICATION_FILTERS.set(filters as ApplicationFilters);
	}

	async function handleSeatFilter(object: Selected<boolean | undefined> | undefined) {
		const seat = object?.value;

		if (seat !== undefined) {
			filters.seat_completed = seat;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		} else {
			filters.seat_completed = undefined;
			applicationData = await fetchApplications(filters, page, entries_per_page);
		}

		APPLICATION_FILTERS.set(filters as ApplicationFilters);
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

	const handleCharacterFilter = debounce(async (event: InputEvent) => {
		const target = event.target as HTMLInputElement | null;
		if (target) {
			filters.character = target.value;
			applicationData = await fetchApplications(filters, page, entries_per_page);

			APPLICATION_FILTERS.set(filters as ApplicationFilters);
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
					let applicationUnsubscribe = APPLICATION_FILTERS.subscribe(async (value) => {
						filters = value ? value : {};
						applicationData = await fetchApplications(filters, page, entries_per_page);
					});

					return () => {
						applicationUnsubscribe();
					};
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

	let error_message = '';
	let status_code = 0;
	let loaded = false;

	let filters: Partial<ApplicationFilters> = {};

	let page = 1;
	let entries_per_page = 10;
	let debounceTimeout: ReturnType<typeof setTimeout>;

	let user: UserDto | undefined | null = undefined;
	let applicationData: GetApplicationsDto = { applications: [], total: 0 };
</script>

<svelte:head>
	<title>Autumn Applications | Applications</title>
</svelte:head>

<section class="flex justify-center w-full">
	{#if error_message}
		<ErrorMessage status={status_code} message={error_message} />
	{:else}
		<Card.Root class="w-full m-4 h-fit">
			<Card.Header>
				<Card.Title class="text-2xl">Applications</Card.Title>
			</Card.Header>
			{#if !loaded}
				<Card.Content>
					<LoadingMessage message="Loading applications..." />
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
							<Select.Root onSelectedChange={handleSeatFilter}>
								<Select.Trigger class="w-36">
									<Select.Value
										placeholder={filters.seat_completed != undefined
											? filters.seat_completed
												? 'Completed'
												: 'Incomplete'
											: 'Discord Status'}
									/>
								</Select.Trigger>
								<Select.Content>
									<Select.Label>SeAT Status</Select.Label>
									<Select.Item value={undefined}>Any</Select.Item>
									<Select.Item value={true}>Completed</Select.Item>
									<Select.Item value={false}>Incomplete</Select.Item>
								</Select.Content>
							</Select.Root>
							<Select.Root onSelectedChange={handleDiscordFilter}>
								<Select.Trigger class="w-36">
									<Select.Value
										placeholder={filters.discord_completed != undefined
											? filters.discord_completed
												? 'Completed'
												: 'Incomplete'
											: 'Discord Status'}
									/>
								</Select.Trigger>
								<Select.Content>
									<Select.Label>Discord Status</Select.Label>
									<Select.Item value={undefined}>Any</Select.Item>
									<Select.Item value={true}>Completed</Select.Item>
									<Select.Item value={false}>Incomplete</Select.Item>
								</Select.Content>
							</Select.Root>
							<Select.Root onSelectedChange={handleStatusFilter}>
								<Select.Trigger class="w-32">
									<Select.Value
										placeholder={filters.status != undefined ? filters.status : 'Status'}
									/>
								</Select.Trigger>
								<Select.Content>
									<Select.Label>Status</Select.Label>
									<Select.Item value={undefined}>Any</Select.Item>
									<Select.Item value={ApplicationStatus.Pending}
										>{ApplicationStatus.Pending.toString()}</Select.Item
									>
									<Select.Item value={ApplicationStatus.Accepted}
										>{ApplicationStatus.Accepted.toString()}</Select.Item
									>
									<Select.Item value={ApplicationStatus.Rejected}
										>{ApplicationStatus.Rejected.toString()}</Select.Item
									>
									<Select.Item value={ApplicationStatus.Joined}
										>{ApplicationStatus.Joined.toString()}</Select.Item
									>
									<Select.Item value={ApplicationStatus.Expired}
										>{ApplicationStatus.Expired.toString()}</Select.Item
									>
								</Select.Content>
							</Select.Root>
							<Select.Root onSelectedChange={handleLocationFilter}>
								<Select.Trigger class="w-32">
									<Select.Value
										placeholder={filters.location != undefined ? filters.location : 'Location'}
									/>
								</Select.Trigger>
								<Select.Content>
									<Select.Label>Location</Select.Label>
									<Select.Item value={undefined}>Any</Select.Item>
									<Select.Item value={ApplicationLocation.Nullsec}
										>{ApplicationLocation.Nullsec}</Select.Item
									>
									<Select.Item value={ApplicationLocation.Highsec}
										>{ApplicationLocation.Highsec}</Select.Item
									>
								</Select.Content>
							</Select.Root>
							<Input
								placeholder={filters.character != undefined ? filters.character : 'Search'}
								class="w-56"
								on:input={handleCharacterFilter}
							/>
						</div>
					</div>
					<Table applications={applicationData.applications} />
				</Card.Content>
				<Card.Footer class="flex justify-between gap-2 flex-wrap">
					<p class="w-1/2">
						Showing {applicationData.applications.length} of {applicationData.total} applications
					</p>
					<div class="w-fit">
						<Pagination.Root
							count={applicationData.total}
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
