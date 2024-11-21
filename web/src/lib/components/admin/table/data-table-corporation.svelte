<script lang="ts">
    export let corporation_id: number;
    export let corporation_name: string;
</script>

<div>
    <a class="flex gap-2 min-w-32 items-center text-hover hover:invert-[0.10]" href="https://zkillboard.com/corporation/{corporation_id}/" target="_blank">
        <img class="rounded-full w-8 h-8" src="https://images.evetech.net/corporations/{corporation_id}/logo?size=32" alt="{corporation_name} logo"/>
        <p>{corporation_name}</p>
    </a>
</div>