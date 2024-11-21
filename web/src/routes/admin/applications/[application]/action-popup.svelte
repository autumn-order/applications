<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import * as Card from "$lib/components/ui/card";
	import { ApplicationLocation, ApplicationStatus, type ApplicationDto } from "$lib/model/application";
	import { afterNavigate } from "$app/navigation";
	import { onMount } from "svelte";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";

    async function handleApplication(status: ApplicationStatus) {
        let reason = "";

        if (status === ApplicationStatus.Rejected && rejection_reason.length < 20) {
            error_message = "Please provide a valid rejection reason.";
            return;
        }

        if (status === ApplicationStatus.Rejected) {
            reason = rejection_reason;
        }

        const request = {
            status: status,
            rejection_reason: reason,
        }

        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/applications/${application.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        });

        if (response.ok) {
            const result: ApplicationDto = await response.json();

            updateApplication(result);
            closePopup();
        } else {
            switch (status) {
                case ApplicationStatus.Accepted:
                    error_message = "Failed to accept application.";
                    break;
                case ApplicationStatus.Rejected:
                    error_message = "Failed to reject application.";
                    break;
                case ApplicationStatus.Cancelled:
                    error_message = "Failed to cancel application.";
                    break;
            }
        }
    }

    function handleRejectionReason(event: InputEvent) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            if (target.value.length > 150) {
                rejection_reason = target.value.slice(0, 150);
            } else {
                rejection_reason = target.value;
            }
        }
    }

    function handleClickOutside(event: any) {
        if (popup_element && !popup_element.contains(event.target)) {
            closePopup()
        }
    }

    onMount(() => {
        if (popup_type !== undefined) {
            document.addEventListener('click', handleClickOutside);
        }
    });

    afterNavigate(() => {
		document.body.classList.remove('overflow-hidden');
    });

    let popup_element: HTMLDivElement;
    let popup_type: ApplicationStatus | undefined = $$props.popup;
    let application: ApplicationDto = $$props.application;

    let rejection_reason: string = "";
    let error_message: string = "";

    export let closePopup: Function;
    export let updateApplication: Function;

    $: popup_type = $$props.popup;

    $: {
        if (popup_type !== undefined) {
            document.body.classList.add('overflow-hidden');
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        } else {
            document.body.classList.remove('overflow-hidden');
            document.removeEventListener('click', handleClickOutside);
        }
    }
</script>

{#if popup_type != undefined}
    <div class="fixed inset-0 bg-neutral-50 dark:bg-black sm:bg-neutral-950 sm:opacity-30 z-40"></div>
    <div class="fixed w-full sm:w-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50" bind:this={popup_element}>
        <Card.Root class="border-0 shadow-none sm:border sm:shadow">
            <Card.Header class="pb-4 border-b border-color">
                <Card.Title class="text-xl">
                    {#if popup_type == ApplicationStatus.Accepted}
                        Confirm Accept Application
                    {:else if popup_type == ApplicationStatus.Rejected}
                        Confirm Reject Application
                    {:else if popup_type == ApplicationStatus.Cancelled}
                        Confirm Cancel Application
                    {/if}
                </Card.Title>
            </Card.Header>
            <Card.Content class="flex flex-col gap-2 sm:max-w-[450px]">
                {#if error_message}
                    <span class="bg-red-800 text-center py-2 rounded text-white">{error_message}</span>
                {/if}
                {#if popup_type === ApplicationStatus.Accepted}
                    <b>Remember the Following</b>
                    <ul class="pl-2">
                        <li>1. Send them an invite in-game to
                            {#if application.location === ApplicationLocation.Nullsec}
                                <b>The Order of Autumn</b>
                            {:else}
                                <b>Autumn Highsec Division</b>
                            {/if}
                        </li>
                        <li>2. Send them an EVE mail with instructions on how to accept their invite.</li>
                    </ul>
                    <p>You can find the acceptance EVE mail format pinned in the <b>#recruitment</b> leadership channel in Discord.</p>
                {:else if popup_type === ApplicationStatus.Cancelled}
                    <b>Remember the Following</b>
                    <ul class="pl-2">
                        <li>1. Applicant can reapply at any time</li>
                        <li>2. Send them an EVE mail following the cancellation EVE mail format.</li>
                    </ul>
                    <p>You can find the cancellation EVE mail format pinned in the <b>#recruitment</b> leadership channel in Discord.</p>
                    <p>Cancellation is for when an applicant is non-responsive or decides they don't want to apply anymore.</p>
                {:else if popup_type === ApplicationStatus.Rejected}
                    <b>Remember the Following</b>
                    <ul class="pl-2">
                        <li>1. Applicant can apply again in 30 days unless they are blacklisted.</li>
                        <li>2. Send them an EVE mail following the rejection EVE mail format including the reason.</li>
                    </ul>
                    <p>You can find the rejection email format pinned in the <b>#recruitment</b> leadership channel in Discord.</p>
                    <p>Please enter the rejection reason that is viewable by the applicant, you will include this in your EVE mail as well:</p>
                    <Textarea class="min-h-32" on:input={handleRejectionReason} bind:value={rejection_reason}/>
                    <p>
                        <span>{rejection_reason.length}</span> / 150 characters, 20 characters minimum
                    </p>
                {/if}
            </Card.Content>
            <Card.Footer>
                <ul class="flex justify-between gap-4 w-full">
                    <li>
                        {#if popup_type == ApplicationStatus.Accepted}
                            <Button class="bg-green-800 hover:bg-green-900 text-white" on:click={() => handleApplication(ApplicationStatus.Accepted)}>Accept Application</Button>
                        {:else if popup_type == ApplicationStatus.Cancelled}
                            <Button on:click={() => handleApplication(ApplicationStatus.Cancelled)}>Cancel Application</Button>
                        {:else if popup_type == ApplicationStatus.Rejected}
                            <Button variant="destructive" on:click={() => handleApplication(ApplicationStatus.Rejected)}>Reject Application</Button>
                        {/if}
                    </li>
                    <li>
                        <Button variant="outline" on:click={() => closePopup()}>Go Back</Button>
                    </li>
                </ul>
            </Card.Footer>
        </Card.Root>
    </div>
{/if}