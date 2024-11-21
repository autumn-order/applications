<script lang="ts">
	import { checkSeAT } from "$lib/stores/application";
	import type { ApplicationDto } from "$lib/model/application";
	import { Button } from "$lib/components/ui/button";
	import { DISCORD_LINK } from "../../../../constants";
	import Fa from "svelte-fa";
	import { faDiscord } from "@fortawesome/free-brands-svg-icons";
	import { faRefresh, faArrowRight } from "@fortawesome/free-solid-svg-icons";

    let application: ApplicationDto | null = $$props.application;
    let seat_completed: boolean = application?.seat_completed ?? false;
    let seat_check_result: undefined | boolean = undefined;
    export let setViewedStep: Function;

    if (!application) {
        seat_completed = true;
    }

    async function checkSeATStatus() {
        seat_check_result = undefined;
        seat_check_result = await checkSeAT();

        if (seat_check_result) {
            setViewedStep(1);
        }
    }
</script>

<div class="flex flex-col flex-grow gap-2 h-full w-full p-2 lg:p-6">
    <h1 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">Step 1. Add All Characters to SeAT</h1>
    <enhanced:img class="w-32 h-32 mx-auto my-4" src="/static/images/application/seat.png" alt="SeAT logo"/>
    <div class="w-full h-full flex flex-wrap">
        <div class="flex flex-col gap-2 w-full items-center">
            <h2 class="text-gradient text-3xl font-bold w-full text-center">What is SeAT?</h2>
            <div class="flex flex-col gap-2 w-full max-w-[900px]">
                <p>SeAT is a web application for EVE Online used for connecting services like Discord with EVE Online characters. It automatically assigns roles based on corporation & alliance membership and overall makes running corporations so much easier in EVE.</p>
                <p>SeAT is additionally used for background checks in EVE Online, espionage is a huge part of EVE and you can find all kinds of stories about how spies have impacted corporations/alliances in EVE. SeAT is one of the many countermeasures we use to mitigate the risk of spies.</p>
            </div>
            <ul class="flex flex-wrap justify-center">
                <li class="w-fit h-fit p-2 lg:w-1/2">
                    <enhanced:img class="border-color border rounded-md shadow-md  max-w-[693px] max-h-[390px] w-full" src="/static/images/application/seat-example.png" alt="SeAT homepage"/>
                </li>
                <li class="w-fit h-fit p-2 lg:w-1/2">
                    <enhanced:img class="border-color border rounded-md shadow-md  max-w-[693px] max-h-[390px] w-full" src="/static/images/application/seat-char-sheet.png" alt="SeAT character sheet"/>
                </li>
            </ul>
        </div>
        <div class="flex flex-col gap-2 w-full h-fit py-4 lg:pt-10">
            <h2 class="text-gradient text-3xl font-bold w-full text-center">How to Setup SeAT</h2>
            <ul class="flex flex-wrap h-full">
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col justify-between items-center h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 1.</h3>
                            <p>Go to <a class="link-color" href="https://seat.autumn-order.com/" target="_blank">https://seat.autumn-order.com/</a> and click <b>LOG IN with EVE Online</b>.</p>
                        </div>
                        <div class="w-fit h-fit">
                            <enhanced:img class="max-w-[644px] max-h-[362px] w-full rounded-md" src="/static/images/application/seat-login.png" alt="SeAT login page"/>
                        </div>
                    </div>
                </li>
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col justify-between items-center h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 2.</h3>
                            <p>Login with EVE Online, if you are playing EVE via Steam, Facebook, or the Epic Games Store login by clicking the relevant icon in the bottom right of the EVE login menu.</p>
                        </div>
                        <div class="w-fit h-fit">
                            <enhanced:img class="max-w-[644px] max-h-[362px] w-full rounded-md" src="/static/images/application/eve-login.png" alt="SeAT login page"/>
                        </div>
                    </div>
                </li>
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col justify-between items-center h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 3.</h3>
                            <p>Click the portrait of the character you're adding to SeAT and then click <b>AUTHORIZE</b>.</p>
                        </div>
                        <div class="w-fit h-fit">
                            <enhanced:img class="max-w-[644px] max-h-[362px] w-full rounded-md" src="/static/images/application/eve-login-select-character.png" alt="EVE login page"/>
                        </div>
                    </div>
                </li>
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col justify-between items-center h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 4.</h3>
                            <p>Click the settings gears in the top right corner of SeAT after logging in and click <b>Link Character</b> in the dropdown.</p>
                        </div>
                        <div class="w-fit h-fit">
                            <enhanced:img class="max-w-[644px] max-h-[362px] w-full rounded-md" src="/static/images/application/seat-link-character.png" alt="SeAT login page"/>
                        </div>
                    </div>
                </li>
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 5.</h3>
                            <p>Repeat the link process for every character you have, don't worry about any old accounts you can't access anymore.</p>
                        </div>
                    </div>
                </li>
                <li class="w-full lg:w-1/2 p-2 max-h-[600px] flex flex-col justify-between items-center">
                    <div class="w-full flex flex-col h-full border border-color rounded-md shadow-md p-4">
                        <div class="w-full flex flex-col gap-2 pb-4">
                            <h3 class="text-center font-bold text-lg">Step 6.</h3>
                            <p>Click the <b>Check SeAT</b> button below to validate your characters have been setup in SeAT.</p>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <ul class="flex flex-wrap justify-center py-4 w-full gap-2">
        <li>
            <a href={DISCORD_LINK} target="_blank">
                <Button class="flex gap-2" variant="outline">
                    <Fa icon={faDiscord} size="lg"/>
                    <p>Questions? Ask us in Discord!</p>
                </Button>
            </a>
        </li>
        <li>
            <Button class="flex gap-2" on:click={() => checkSeATStatus()} disabled={seat_completed}>
                <Fa  icon={faRefresh} size="lg"/>
                <p>Check SeAT</p>
            </Button>
        </li>
    </ul>
    {#if seat_check_result === false}
        <div class="flex flex-col gap-2 w-full text-center">
            <p>SeAT is not yet completed, please ensure the character you are applying with is logged in at <a class="link-color" target="_blank" href="https://seat.autumn-order.com">https://seat.autumn-order.com</a>.</p>
            <p>If you continue to have issues please ask us for assistance in the <a class="link-color" target="_blank" href={DISCORD_LINK}>Autumn Discord</a>!</p>
        </div>
    {/if}
    {#if seat_completed}
        <div class="flex flex-col gap-2 w-full text-center">
            <p>SeAT setup complete! You can now move on to the next step.</p>
        </div>
    {/if}
    <ul class="flex w-full justify-end gap-2 pt-6">
        <li>
            <Button class="flex gap-2 items-center" variant="outline" disabled={!seat_completed} on:click={() => setViewedStep(1)}>
                <p>Next Step</p>
                <Fa icon={faArrowRight}/>
            </Button>
        </li>
    </ul>
</div>