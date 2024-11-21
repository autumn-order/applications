<script lang="ts">
	import { ApplicationLocation } from "$lib/model/application";

    export let location: ApplicationLocation;
</script>

{#if location === ApplicationLocation.Highsec}
    <span class="text-amber-700">Autumn Highsec Division</span>
{:else if location === ApplicationLocation.Nullsec}
    <span class="text-orange-500">The Order of Autumn</span>
{/if}