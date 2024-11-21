<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import Fa from "svelte-fa";
	import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

    let user = $$props.user
    
    let user_name = "";

    if (user) {
        user_name = user.character_name;
    }

    export let setViewedStep: Function;
</script>

<div class="flex flex-col flex-grow gap-2 justify-center items-center h-full w-full p-2 lg:p-6">
    <div class="flex flex-col gap-2 justify-center items-center h-full">
        <div>
            <enhanced:img src="/static/logo512black.png" class="w-64 h-64 block dark:hidden" alt="site logo"/>
            <enhanced:img src="/static/logo512white.png" class="w-64 h-64 hidden dark:block" alt="site logo"/>
        </div>
        <h1 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">Application Submitted</h1>
        <h2 class="text-gradient text-xl sm:text-2xl w-full text-center">Thank you for your application {user_name}!</h2>
        <p>Your application will be reviewed shortly by our recruitment team, majority of invites are sent within 24 hours.</p>
        <p>Feel free to come back at any time to modify your application questions or switch your application to a different area of space.</p>
        <p>While you wait come hang out with us in Discord, let us know if you have any questions or simply introduce yourself to the community!</p>
    </div>
    <ul  class="flex w-full justify-between gap-2">
        <li>
            <Button class="flex gap-2 items-center" variant="outline" on:click={setViewedStep(2)}>
                <Fa icon={faArrowLeft}/>
                <p>Previous Step</p>
            </Button>
        </li>
    </ul>
</div>