<script lang="ts">
    import Progress from "$lib/components/ui/progress/progress.svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";
    
    $: viewed_step = $$props.viewed_step;
    $: completed_steps = $$props.completed_steps;
    export let setViewedStep;

    const steps: string[] = [
        "Setup SeAT",
        "Setup Discord",
        "Application Questions",
        "Wait for Invitation",
        "Accept Invitation"
    ];
</script>

<div class="secondary-bg border-color w-full border-b flex flex-col items-center justify-center py-4 gap-2">
    <h1 class="text-lg font-bold">Application Progress</h1>
    <div class="flex flex-col gap-2 w-full px-2">
        <ul class="justify-evenly flex">
            {#each steps as step, index}
                <li class="w-1/5 flex justify-center items-center
                    {index < completed_steps ? (index === viewed_step ? "text-green-500 underline" : "text-green-700 hover:text-green-500") : ""}
                    {index === completed_steps ? (index === viewed_step ? "underline" : "") : ""}
                    {index > completed_steps ? "text-neutral-400" : ""}
                ">
                    <button on:click={setViewedStep(index)} class="flex justify-center items-center gap-1 lg:gap-2 text-center text-sm lg:text-base flex-wrap sm:flex-nowrap">
                        {#if index < completed_steps}
                            <Fa icon={faCheck} size="sm"/>
                        {/if}
                        <p>{step}</p>
                    </button>
                </li>
            {/each}
        </ul>
        <Progress max={steps.length} value={completed_steps}/>
    </div>
</div>