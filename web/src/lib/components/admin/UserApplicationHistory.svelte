<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Pagination from "$lib/components/ui/pagination";
    import Table from "$lib/components/admin/application-table"
    import Loading from "../messages/LoadingMessage.svelte";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import type { GetApplicationsDto } from "$lib/model/application";
	import { onMount } from "svelte";

    async function fetchApplicationHistory(user_id: number, page: number): Promise<void> {
        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/applications?page=${page}&limit=${10}&user=${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            application_history = await response.json();
        } else {
            application_history = { applications: [], total: 0 }
        }
    }

    function handleChangePage(new_page: number) {
        applications_page = new_page;

        (async () => {
            await fetchApplicationHistory(user_id, applications_page)
        })();
    }

    onMount(async () => {
        await fetchApplicationHistory(user_id, applications_page);
    });

    let applications_page = 1;
    let application_history: GetApplicationsDto | undefined = undefined; 

    export let user_id: number;
</script>

<Card.Root>
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Application History</Card.Title>
    </Card.Header>
    {#if application_history === undefined}
        <Card.Content>
            <Loading message="Loading applications..."/>
        </Card.Content>
    {:else if application_history && application_history.applications.length === 0}
        <Card.Content>
                <p>No previous applications found.</p>
        </Card.Content>
    {:else}
        <Card.Content>
            <Table applications={application_history.applications}/>
        </Card.Content>
        <Card.Footer class="flex justify-between gap-2 flex-wrap">
            <p class="w-1/2">Showing {application_history.applications.length} of {application_history.total} applications</p>
            <div class="w-fit">
                <Pagination.Root count={application_history.total} perPage={10} let:pages let:currentPage>
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