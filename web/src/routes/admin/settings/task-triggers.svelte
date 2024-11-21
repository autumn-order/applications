<script lang="ts">
	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { faTimes } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    async function checkAcceptedApplications() {
        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/task/check-accepted-applications`,
            {
                method: "GET",
                credentials: "include"
            }
        )
        
        if (response.ok) {
            const result: string = await response.text();

            banner_text = result;
        } else {
            banner_text = "Failed to check accepted applications due to internal server error.";
        }
    }

    async function syncSeatRoles() {
        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/task/sync-seat-roles`,
            {
                method: "GET",
                credentials: "include"
            }
        )
        
        if (response.ok) {
            const result: string = await response.text();

            banner_text = result;
        } else {
            banner_text = "Failed to sync seat roles due to internal server error.";
        }
    }

    let banner_text = "";
</script>

<Card.Root>
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Run Update Tasks</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex justify-between items-center w-full bg-green-700 rounded mb-2 p-2 {banner_text !== "" ? "" : "hidden"}">
            <span class="text-white">{banner_text}</span>
            <Button size="icon" variant="outline" class="w-5 h-5" on:click={() => banner_text = ""}>
                <Fa icon={faTimes}/>
            </Button>
        </div>
        <ul class="flex flex-col gap-4">
            <li>
                <p class="mb-2">Check applications for any expired applications or accepted applicants that have joined.</p>
                <Button variant="outline" on:click={() => checkAcceptedApplications()}>Check Applications</Button>
            </li>
            <li>
                <p class="mb-2">Sync roles & role members with SeAT.</p>
                <Button variant="outline"  on:click={() => syncSeatRoles()}>Sync SeAT Roles</Button>
            </li>
        </ul>
    </Card.Content>
</Card.Root>