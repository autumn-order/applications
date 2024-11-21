
<script lang="ts" context="module">
    export enum ApplicationSteps {
        SeAT = 0,
        Discord = 1,
        Questions = 2,
        Review = 3,
        AcceptInvite = 4,
        Joined = 5
    }
</script>

<script lang="ts">
	import { ApplicationStatus, type ApplicationDto } from "$lib/model/application";
	import type { UserDto } from "$lib/model/user";
	import { getApplication } from "$lib/stores/application";
	import { onMount } from "svelte";
	import type { Unsubscriber } from "svelte/motion";
	import { CORPORATIONS } from "../../../constants";

    import {
        Step1ChooseLocation,
        Step2SetupSeAT,
        Step3SetupDiscord,
        Step4AnswerQuestions,
        Step5ApplicationReview,
        Step6AcceptInvite,
    } from './steps';

	import AppRejected from "./results/AppRejected.svelte";
	import AppProgressIndicator from "./AppProgressIndicator.svelte";
	import Welcome from "./results/Welcome.svelte";
	import MemberBanner from "./MemberBanner.svelte";
	import SwitchLocationBanner from "./SwitchLocationBanner.svelte";
    
    let viewed_step: ApplicationSteps | undefined = undefined;
    let current_step: ApplicationSteps = 0;

    let user: UserDto | null | undefined = $$props.user;
    let application: undefined | null | ApplicationDto = undefined;

    onMount(() => {
        let applicationUnsubscribe: Unsubscriber | null = null;

        if (user) {
            const applicationStore = getApplication();

            applicationUnsubscribe = applicationStore.subscribe(value => {
                application = value; 

                if (CORPORATIONS.some(corp => corp.corporation_id === user?.corporation_id)) {
                    application = null;
                    current_step = ApplicationSteps.Joined;
                    
                    if (viewed_step === undefined) {
                        viewed_step = ApplicationSteps.AcceptInvite;
                    }
                } else if (application) {
                    if (!application.seat_completed) {
                        current_step = ApplicationSteps.SeAT;
                    } else if (!application.discord_completed) {
                        current_step = ApplicationSteps.Discord;
                    } else if (
                        application.questions.referrer === null ||
                        application.questions.region === null ||
                        application.questions.languages.length < 1 ||
                        application.questions.interests.length < 1 ||
                        application.questions.end_goals.length === 0 ||
                        application.questions.why_autumn.length === 0
                    ) {
                        current_step = ApplicationSteps.Questions;
                    } else if (application.status === ApplicationStatus.Pending) {
                        current_step = ApplicationSteps.Review;
                    } else if (application.status === ApplicationStatus.Accepted) {
                        current_step = ApplicationSteps.AcceptInvite;
                    }

                    if (viewed_step === undefined) {
                        viewed_step = current_step;
                    }
                }
            });
        }

        return () => {
            if (applicationUnsubscribe) {
                applicationUnsubscribe();
            }
        }
    });

    function setViewedStep(new_viewed_step: ApplicationSteps) {
        if (new_viewed_step > current_step) {
            return;
        }

        viewed_step = new_viewed_step;
        window.scrollTo(0, 0);
    }

    function setCurrentStep(new_current_step: ApplicationSteps) {
        current_step = new_current_step;
    }

    // BACKEND Logic
    // 1. SeAT - check SeAT dev api is logged in user character is on SeAT
    // 2. Discord - check SeAT dev connnector api if user has linked discord
    // 3. Questions - check if user has filled out questions
    // 4. Fetch application status from backend
    // 5. This only works if affiliation is marked as one of the member corps which has upwards of an hour long delay due to ESI caching
</script>

<div class="flex flex-col flex-grow w-full h-full">
    {#if application === undefined}
        <div>Loading...</div>
    {:else if application === null && current_step !== ApplicationSteps.Joined}
        <Step1ChooseLocation/>
    {:else if application && application.status === ApplicationStatus.Rejected}
        {#if application.status === ApplicationStatus.Rejected}
            <AppRejected application={application}/>
        {/if}
    {:else if application || current_step === ApplicationSteps.Joined}
        <AppProgressIndicator viewed_step={viewed_step} completed_steps={current_step} setViewedStep={setViewedStep}/>
        {#if application}
            <SwitchLocationBanner user={user}/>
        {:else}
            <MemberBanner/>
        {/if}
        {#if viewed_step === ApplicationSteps.SeAT}
            <Step2SetupSeAT application={application} setViewedStep={setViewedStep}/>
        {:else if viewed_step === ApplicationSteps.Discord}
            <Step3SetupDiscord application={application} setViewedStep={setViewedStep}/>
        {:else if viewed_step === ApplicationSteps.Questions}
            <Step4AnswerQuestions application={application} setViewedStep={setViewedStep} setCurrentStep={setCurrentStep}/>
        {:else if viewed_step === ApplicationSteps.Review}
            <Step5ApplicationReview user={user} setViewedStep={setViewedStep}/>
        {:else if viewed_step === ApplicationSteps.AcceptInvite || current_step === ApplicationSteps.Joined}
            {#if current_step !== ApplicationSteps.Joined} 
                <Step6AcceptInvite/>
            {:else}
                <Welcome user={user}/>
            {/if}
        {/if}
    {/if}
</div>