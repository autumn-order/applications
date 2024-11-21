<script lang="ts">
	import { page } from "$app/stores";
    import * as Card from "$lib/components/ui/card";
    import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public'
	import { ApplicationLocation, ApplicationStatus, type ApplicationDto } from "$lib/model/application";
	import Fa from "svelte-fa";
	import { faDiscord } from "@fortawesome/free-brands-svg-icons";
	import { faFile, faIdCard, faList,faSignsPost } from "@fortawesome/free-solid-svg-icons";
	import { Button } from "$lib/components/ui/button";
	import ActionPopup from "./action-popup.svelte";
    import LoadingMessage from "$lib/components/messages/LoadingMessage.svelte";
	import ErrorMessage from "$lib/components/messages/ErrorMessage.svelte";
	import UserApplicationHistory from "$lib/components/admin/UserApplicationHistory.svelte";
    import { Permissions } from "$lib/model/permission";
	import type { Unsubscriber } from "svelte/store";
	import { getUser } from "$lib/stores/user";
	import type { UserDto } from "$lib/model/user";
	import { onMount } from "svelte";

    async function fetchApplicationData(application_id: number): Promise<void> {
        try {
            const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/applications/${application_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                application = await response.json();
            } else {
                error_message = await response.text();
                status_code = response.status;
            }
        } catch (error) {
            error_message = 'Request timed out';
            status_code = 408;
        }
    }

    async function updateApplication(updated_application: ApplicationDto) {
        application = updated_application;
    }

    function closePopup() {
        popup_type = undefined;
    }

    let application_id: number = parseInt($page.params.application);
    let user_id: number | undefined = undefined;

    let application: ApplicationDto | undefined = undefined;
    let popup_type: ApplicationStatus | undefined = undefined;

    let applications_page = 1;
    let application_info_image_size = "w-32 h-32"

    let application_questions_complete = false;

    let error_message = "";
    let status_code = 0;

    onMount(() => {
        let unsubscribe: Unsubscriber;

        const userStore = getUser();

        unsubscribe = userStore.subscribe(value => {
            if (value) {
                if (
                    value.permissions.includes(Permissions.ViewApplication) ||
                    value.permissions.includes(Permissions.Admin))
                {
                    user = value;
                } else if (value === null) {
                    status_code = 403;
                    error_message = "You do not have permission to access this page";
                }
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    });

    $: application_id = parseInt($page.params.application);

    $: {
        if (user) {
            (async () => {
                if (!isNaN(application_id)) {
                    await fetchApplicationData(application_id);
                } else {
                    status_code = 400;
                    error_message = "Application ID requested is not a number.";
                }
            })();
        }
    }

    $: {
        if (application && application.reviewer) {
            application_info_image_size = "w-24 h-24"
        }
    }

    $: {
        if (application && user_id !== application?.user.id) {
            user_id = application?.user.id;
            applications_page = 1;
        }
    }

    $: {
        if (
            application &&
            application.questions.referrer !== null &&
            application.questions.region !== null &&
            application.questions.languages.length > 0 &&
            application.questions.interests.length > 0 &&
            application.questions.end_goals !== "" &&
            application.questions.why_autumn !== ""
        ) {
            application_questions_complete = true;
        }
    }

    let user: UserDto | undefined | null = undefined; 
</script>

<section class="flex w-full pt-4 md:p-4">
    {#if error_message}
        <ErrorMessage status={status_code} message={error_message}/>
    {:else if application === undefined || user === undefined}
        <LoadingMessage message="Loading role info"/>
    {:else if user}
        <ActionPopup popup={popup_type} {application} {closePopup} {updateApplication}/>
        <div class="flex-col w-full h-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/2 md:pr-2">
                    <Card.Root class="w-full h-full">
                        <Card.Header class="pb-4 border-b border-color">
                            <Card.Title class="text-xl">Applicant Info</Card.Title>
                        </Card.Header>
                        <Card.Content class="min-h-72 flex flex-col gap-2 items-center justify-evenly text-center">
                            <ul class="flex gap-4 justify-evenly w-full">
                                <a href="/admin/users/{user_id}" class="flex flex-col gap-2">
                                    <img class="rounded-full {application_info_image_size} self-center" src="https://images.evetech.net/characters/{application.user.character_id}/portrait?size=128" alt="{application.user.character_name}'s portrait"/>
                                    <p class="border-color">{application.user.character_name}</p>
                                </a>
                                <a href="https://zkillboard.com/corporation/{application.user.corporation_id}/" target="_blank" class="flex flex-col gap-2">
                                    <img class="rounded-full {application_info_image_size} self-center" src="https://images.evetech.net/corporations/{application.user.corporation_id}/logo?size=128" alt="{application.user.corporation_name} logo"/>
                                    <p class="border-color">{application.user.corporation_name}</p>
                                </a>
                            </ul>
                            {#if application.reviewer}
                                <div class="flex flex-col gap-3">
                                    <p class="font-bold">Reviewed by</p>
                                    <div>
                                        <a href="/admin/users/{application.reviewer.id}" class="flex gap-4 items-center">
                                            <img class="rounded-full w-16 h-16" src="https://images.evetech.net/characters/{application.reviewer.character_id}/portrait?size=64" alt="{application.user.character_name}'s portrait"/>
                                            <p class="border-color">{application.reviewer.character_name}</p>
                                        </a>
                                    </div>
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>
                <div class="w-full md:w-1/2 md:pl-2 pt-4 md:pt-0">
                    <Card.Root class="w-full h-full">
                        <Card.Header class="pb-4 border-b border-color">
                            <Card.Title class="text-xl">Application Status</Card.Title>
                        </Card.Header>
                        <Card.Content class="min-h-72">
                            <ul class="flex flex-col flex-grow">
                                <li class="flex gap-2 p-1 border-b border-color items-center flex-wrap">
                                    <Fa class="h-6 w-6" icon={faSignsPost}/> 
                                    <p class="font-bold">Corp:</p>
                                    {#if application.location === ApplicationLocation.Nullsec}
                                        <p class="text-orange-500">The Order of Autumn</p>
                                    {:else if application.location === ApplicationLocation.Highsec}
                                        <p class="text-amber-700">Autumn Highsec Division</p>
                                    {/if}
                                </li>
                                <li class="flex gap-2 p-1 border-b border-color items-center">
                                    <Fa class="h-6 w-6" icon={faIdCard}/>
                                    <p class="font-bold">SeAT:</p>
                                    {#if application.discord_completed}
                                        <p class="text-green-700 dark:text-green-500">Complete</p>
                                    {:else}
                                        <p class="text-red-700 dark:text-red-500">Incomplete</p>
                                    {/if}  
                                </li>
                                <li class="flex gap-2 p-1 border-b border-color items-center">
                                    <Fa class="h-6 w-6" icon={faDiscord}/>
                                    <p class="font-bold">Discord:</p>
                                    {#if application.discord_completed}
                                        <p class="text-green-700 dark:text-green-500">Complete</p>
                                    {:else}
                                        <p class="text-red-700 dark:text-red-500">Incomplete</p>
                                    {/if}
                                </li>
                                <li class="flex gap-2 p-1 border-b border-color items-center">
                                    <Fa class="h-6 w-6" icon={faList}/>
                                    <p class="font-bold">Questions:</p>
                                    {#if application_questions_complete}
                                        <p class="text-green-700 dark:text-green-500">Complete</p>
                                    {:else}
                                        <p class="text-red-700 dark:text-red-500">Incomplete</p>
                                    {/if}
                                </li>
                                <li class="flex gap-2 p-1 border-b border-color items-center">
                                    <Fa class="h-6 w-6" icon={faFile}/>
                                    <p class="font-bold">Application Status:</p>
                                    {#if application.status === ApplicationStatus.Pending}
                                        <p class="text-yellow-700 dark:text-yellow-500">Pending</p>
                                    {:else if application.status === ApplicationStatus.Rejected}
                                        <p class="text-red-700 dark:text-red-500">Rejected</p>
                                    {:else if application.status === ApplicationStatus.Accepted}
                                        <p class="text-green-700 dark:text-green-500">Accepted</p>
                                    {:else if application.status === ApplicationStatus.Joined}
                                        <p class="text-blue-700 dark:text-blue-500">Joined</p>
                                    {:else if application.status === ApplicationStatus.Expired}
                                        <p class="text-gray-700 dark:text-gray-500">Expired</p>
                                    {:else if application.status === ApplicationStatus.Cancelled}
                                        <p class="text-gray-700 dark:text-gray-500">Cancelled</p>
                                    {/if}
                                </li>
                            </ul>
                            {#if application.status === ApplicationStatus.Rejected}
                                <div>
                                    <p class="font-bold">Rejection Reason:</p>
                                    <p>{application.rejection_reason}</p>
                                </div>
                            {:else if application.status === ApplicationStatus.Accepted || application.status === ApplicationStatus.Pending}
                                <ul class="flex justify-center gap-8 items-center pt-6">
                                    {#if application.status !== ApplicationStatus.Accepted}
                                        {#if user && user.permissions.includes(Permissions.AcceptApplication) || user.permissions.includes(Permissions.Admin)}
                                            <li>
                                                <Button class="bg-green-800 hover:bg-green-900 text-white" on:click={() => popup_type = ApplicationStatus.Accepted}>Accept</Button>
                                            </li>
                                        {/if}
                                    {/if}
                                    {#if user.permissions.includes(Permissions.RejectApplication) || user.permissions.includes(Permissions.Admin)}
                                        <li>
                                            <Button variant="secondary" on:click={() => popup_type = ApplicationStatus.Cancelled}>Cancel</Button>
                                        </li>
                                        <li>
                                            <Button variant="destructive" on:click={() => popup_type = ApplicationStatus.Rejected}>Reject</Button>
                                        </li>
                                    {/if}
                                </ul>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
            <div class="pt-4">
                <Card.Root>
                    <Card.Header class="pb-4 border-b border-color">
                        <Card.Title class="text-xl">Application Questions</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <ul class="flex w-full justify-evenly flex-wrap min-h-32">
                            <ul class="flex justify-evenly gap-2 w-full md:w-1/3 flex-wrap">
                                <li class="text-center flex flex-col gap-2 w-1/2">
                                    <p class="font-bold">Referrer</p>
                                    <p>{application.questions.referrer}</p>
                                </li>
                                <li class="text-center flex flex-col gap-2 w-1/2">
                                    <p class="font-bold">Region</p>
                                    <p>{application.questions.region}</p>
                                </li>
                            </ul>
                            <li class="text-center flex flex-col gap-2 pt-2 w-full md:pt-0 md:w-1/3">
                                <p class="font-bold">Languages</p>
                                <ul class="flex gap-2 flex-wrap justify-center">
                                    {#each application.questions.languages as language}
                                        <li class="border border-color p-1 rounded-md">{language}</li>
                                    {/each}
                                </ul>
                            </li>
                            <li class="text-center flex flex-col gap-2 pt-2 w-full md:pt-0 md:w-1/3">
                                <p class="font-bold">Interests</p>
                                <ul class="flex gap-2 flex-wrap justify-center">
                                    {#each application.questions.interests as interest}
                                        <li class="border border-color p-1 rounded-md">{interest}</li>
                                    {/each}
                                </ul>
                            </li>
                        </ul>
                        <ul class="flex flex-col md:flex-row w-full justify-evenly pt-2 md:pb-8 min-h-32">
                            <li class="w-full md:w-1/2 p-2">
                                <p class="font-bold text-center pb-2">Why Autumn?</p>
                                <p class="border p-2 h-full rounded border-color min-h-32">{application.questions.why_autumn}</p>
                            </li>
                            <li class="w-full md:w-1/2 p-2">
                                <p class="font-bold text-center pb-2">End Goals</p>
                                <p class="border p-2 h-full rounded border-color min-h-32">{application.questions.end_goals}</p>
                            </li>
                        </ul>
                    </Card.Content>
                </Card.Root>
            </div>
            <div class="pt-4">
                {#if user_id}
                    <UserApplicationHistory {user_id}/>
                {/if}
            </div>
        </div>
    {/if}
</section>