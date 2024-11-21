<script lang="ts">
	import type { Selected } from "bits-ui";
	import { onDestroy, onMount } from "svelte";

    import Input from "$lib/components/ui/input/input.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Select from "$lib/components/ui/select";
    import * as Pagination from "$lib/components/ui/pagination";
    import Table from "$lib/components/admin/user-table"
	import type { GetSeatRoleUserFilters, GetSeatRoleUsersDto } from "$lib/model/seat_role";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";

    async function fetchRoleUsers(filters: Partial<GetSeatRoleUserFilters>, seat_role_id: number, page: number, entries_per_page: number): Promise<GetSeatRoleUsersDto> {
        let request = `${PUBLIC_VITE_BACKEND_URL}/admin/roles/${seat_role_id}/users?page=${page}&limit=${entries_per_page}`;

        if (filters.character) {
            request += `&character=${filters.character}`;
        }

        const response = await fetch(request, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            return {
                users: [],
                total: 0
            };
        }

        const result: GetSeatRoleUsersDto = await response.json();

        return result;
    }

    function handleChangeEntriesPerPage(object: Selected<number> | undefined) {
        const entry_count = object?.value;

        if (entry_count) {
            entries_per_page = entry_count;

            (async () => {
                roleUserData = await fetchRoleUsers(filters, seat_role_id, page, entries_per_page)
            })();
        }
    }

    function handleChangePage(new_page: number) {
        if(page === new_page) return;

        page = new_page;

        (async () => {
            roleUserData = await fetchRoleUsers(filters, seat_role_id, page, entries_per_page)
        })();
    }

    const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
        return (...args: Parameters<T>) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func.apply(null, args), delay);
        };
    }

    const handleCharacterFilter = debounce(async (event: InputEvent) => {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            filters.character = target.value;
            roleUserData = await fetchRoleUsers(filters, seat_role_id, page, entries_per_page);
        }
    }, 300);

    onDestroy(() => {
        clearTimeout(debounceTimeout);
    });

    onMount(async () => {
        roleUserData = await fetchRoleUsers(filters, seat_role_id, page, entries_per_page);
    });

    let debounceTimeout: ReturnType<typeof setTimeout>;

    let page = 1;
    let entries_per_page = 10;
    let roleUserData: GetSeatRoleUsersDto = { users: [], total: 0 }; 
    let filters: Partial<GetSeatRoleUserFilters> = {};

    export let seat_role_id: number;
</script>

<Card.Root>
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Role Members</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <div class="flex gap-2 justify-between flex-wrap">
            <div class="flex gap-2 items-center">
                <p>Show</p>
                <Select.Root onSelectedChange={handleChangeEntriesPerPage}>
                    <Select.Trigger class="w-20 h-8">
                        <Select.Value placeholder="10"/>
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
                <Input placeholder="Search" class="w-56" on:input={handleCharacterFilter}/>
            </div>
        </div>
        <Table users={roleUserData.users}/>
    </Card.Content>
    <Card.Footer class="flex justify-between gap-2 flex-wrap">
        <p class="w-1/2">Showing {roleUserData.users.length} of {roleUserData.total} users</p>
        <div class="w-fit">
            <Pagination.Root count={roleUserData.total} perPage={entries_per_page} let:pages let:currentPage>
                <Pagination.Content>
                    <Pagination.Item>
                        <Pagination.PrevButton on:click={() => handleChangePage((currentPage ?? 1) - 1)}/>
                    </Pagination.Item>
                    {#each pages as page}
                        {#if page.type === "ellipsis"}
                            <Pagination.Item>
                                <Pagination.Ellipsis />
                            </Pagination.Item>
                        {:else}
                            <Pagination.Item>
                                {#if page.value > 0}
                                    <Pagination.Link {page} isActive={(currentPage ?? 1) == page.value} on:click={() => handleChangePage(page.value)}>
                                        {page.value}
                                    </Pagination.Link>
                                {/if}
                            </Pagination.Item>
                        {/if}
                    {/each}
                    <Pagination.Item>
                        <Pagination.NextButton on:click={() => handleChangePage((currentPage ?? 1) + 1)}/>
                    </Pagination.Item>
                </Pagination.Content>
            </Pagination.Root>
        </div>
    </Card.Footer>
</Card.Root>