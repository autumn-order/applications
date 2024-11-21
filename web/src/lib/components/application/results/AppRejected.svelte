<script lang="ts">
	import { faDiscord } from "@fortawesome/free-brands-svg-icons";
	import { DISCORD_LINK } from "../../../../constants";
	import { Button } from "../../ui/button";
	import Fa from "svelte-fa";
	import type { ApplicationDto } from "$lib/model/application";

    let application: ApplicationDto = $$props.application

    let rejection_reason: string = "No reason provided, please contact an officer for more information.";

    if (application) {
        if (application.rejection_reason) {
            rejection_reason = application.rejection_reason;
        }
    }
</script>

<div class="flex flex-col gap-2 justify-center items-center h-full w-full text-center p-2 lg:p-6">
    <h1 class="text-gradient text-xl sm:text-3xl font-bold w-full text-center">We're Sorry</h1>
    <p>Unfortunately your application has been rejected for the following reason:</p>
    <p class="border-color p-0.5 px-3 bg-red-800 min-w-32 rounded border text-center min-h-6">{rejection_reason}</p>
    <p>So long as you aren't blacklisted you are more than welcome to apply again after 30 days.</p>
    <p>If you believe this was a mistake please contact us via the Autumn Discord.</p>
    <div>
        <a href={DISCORD_LINK} target="_blank">
            <Button class="flex gap-2" variant="outline">
                <Fa icon={faDiscord} size="lg"/>
                <p>Autumn Discord</p>
            </Button>
        </a>
    </div>
</div>