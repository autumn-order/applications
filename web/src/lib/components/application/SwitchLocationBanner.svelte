<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { ApplicationLocation, type ApplicationDto } from "$lib/model/application";
	import { getApplication, setApplicationLocation } from "$lib/stores/application";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import type { Unsubscriber } from "svelte/store";
	import { onMount } from "svelte";

    let user = $$props.user;
    let application: ApplicationDto | undefined | null = $$props.application;

    onMount(() => {
        let applicationUnsubscribe: Unsubscriber | null = null;

        if (user) {
            const applicationStore = getApplication();

            applicationUnsubscribe = applicationStore.subscribe(value => {
                application = value; 
            });
        }

        return () => {
            if (applicationUnsubscribe) {
                applicationUnsubscribe();
            }
        }
    });

    function changeLocation(location: ApplicationLocation) {
        setApplicationLocation(location);
    }
</script>

{#if !application}
    <div class="w-full flex gap-2 items-center justify-center p-2 text-white">
        <p>Loading...</p>
    </div>
{:else if application.location === ApplicationLocation.Nullsec}
    <div class="w-full flex gap-2 items-center justify-center p-2 bg-gradient-to-r from-red-950 to-orange-900 ">
        <p class="text-center text-white">You are applying to The Order of Autumn</p>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button builders={[builder]} class="flex gap-1" size="sm" variant="outline">Apply to <span class="text-blue-500">highsec</span> instead</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                <DropdownMenu.Item on:click={() => changeLocation(ApplicationLocation.Highsec)} class="cursor-pointer">Confirm switch to highsec application</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
{:else if application.location === ApplicationLocation.Highsec}
    <div class="w-full flex gap-2 items-center justify-center p-2 bg-gradient-to-r from-blue-950 to-sky-900 text-white">
        <p class="text-center text-white">You are applying to Autumn Highsec Division</p>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button builders={[builder]} class="flex gap-1" size="sm" variant="outline">Apply to <span class="text-red-500">nullsec</span> instead</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                <DropdownMenu.Item on:click={() => changeLocation(ApplicationLocation.Nullsec)} class="cursor-pointer">Confirm switch to nullsec application</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
{/if}