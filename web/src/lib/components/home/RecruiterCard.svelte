<script lang="ts" context="module">
    export interface Recruiter {
        id: number;
        name: string;
        discord: string;
        title: string;
    }
</script>

<script lang="ts">
	import { faDiscord } from "@fortawesome/free-brands-svg-icons";

	import Fa from "svelte-fa";

    let recruiter: Recruiter = $$props.recruiter;
</script>

<div class="flex gap-4 secondary-bg border-color border rounded-sm shadow-md p-4 px-6">
    <img 
        class="rounded-full w-24 h-24"
        src="https://images.evetech.net/characters/{recruiter.id}/portrait?size=128" 
        alt={`${recruiter.name} avatar`}
    />
    <div class="flex flex-col justify-evenly">
        <p class="font-bold">{recruiter.title}</p>
        <p class="font-bold">{recruiter.name}</p>
        <div class="flex gap-1 items-center">
            <Fa icon={faDiscord}/>
            <p>{recruiter.discord}</p>
        </div>
    </div>
</div>