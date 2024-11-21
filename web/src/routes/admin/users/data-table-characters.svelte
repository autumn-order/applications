<script lang="ts">
	import type { CharacterDto } from "$lib/model/character";

    export let characters: CharacterDto[];
</script>

<ul class="flex gap-1">
    {#each characters as character}
        <li>
            <a href="https://zkillboard.com/character/{character.character_id}/" target="_blank">
                <img class="w-8 h-8 rounded-full" src="https://images.evetech.net/characters/{character.character_id}/portrait?size=32" alt="{character.character_name}'s' portrait">
            </a>
        </li>
    {/each}
</ul>