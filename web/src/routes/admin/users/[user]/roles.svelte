<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Pagination from "$lib/components/ui/pagination";
    import Table from "./role-table.svelte"
    import Loading from "$lib/components/messages/LoadingMessage.svelte";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import { onMount } from "svelte";
	import type { GetUserRolesDto } from "$lib/model/user";

    async function fetchUserRoles(user_id: number, page: number): Promise<void> {
        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/users/${user_id}/roles?page=${page}&limit=${10}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            user_roles = await response.json();
        } else {
            user_roles = { roles: [], total: 0 }
        }
    }

    function handleChangePage(new_page: number) {
        roles_page = new_page;

        (async () => {
            await fetchUserRoles(user_id, roles_page)
        })();
    }

    onMount(async () => {
        await fetchUserRoles(user_id, roles_page);
    });

    let roles_page = 1;
    let user_roles: GetUserRolesDto | undefined = undefined; 

    export let user_id: number;
</script>

<Card.Root class="h-full">
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Roles</Card.Title>
    </Card.Header>
    {#if user_roles === undefined}
        <Card.Content>
            <Loading message="Loading applications..."/>
        </Card.Content>
    {:else if user_roles && user_roles.roles.length === 0}
        <Card.Content>
                <p>No roles found.</p>
        </Card.Content>
    {:else}
        <Card.Content>
            <Table roles={user_roles.roles}/>
        </Card.Content>
        <Card.Footer class="flex justify-between gap-2 flex-wrap">
            <p class="w-1/2">Showing {user_roles.roles.length} of {user_roles.total} roles</p>
            <div class="w-fit">
                <Pagination.Root count={user_roles.total} perPage={10} let:pages let:currentPage>
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
                                    <Pagination.Link {page} isActive={(currentPage ?? 1) == page.value} on:click={() => handleChangePage(page.value)}>
                                        {page.value}
                                    </Pagination.Link>
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
    {/if}
</Card.Root>