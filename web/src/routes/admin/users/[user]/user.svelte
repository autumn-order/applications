<script lang="ts">
    import * as Card from "$lib/components/ui/card";
	import type { UserCharactersDto } from "$lib/model/user";

    export let user: UserCharactersDto;
</script>

<Card.Root class="h-full">
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Characters</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex flex-col items-center pb-4 gap-2">
            <div>
                <a href="https://zkillboard.com/character/{user.main_character.character_id}/" class="flex flex-col items-center gap-2 text-hover hover:invert-[0.04]" target="_blank">
                    <img class="rounded-full h-32 w-32" src="https://images.evetech.net/characters/{user.main_character.character_id}/portrait?size=128" alt="{user.main_character.character_name}'s portrait">
                    <p class="text-lg">{user.main_character.character_name}</p>
                </a>
            </div>
            <div>
                <a href="https://zkillboard.com/corporation/{user.main_character.corporation_id}/" class="flex items-center gap-2 text-hover hover:invert-[0.04]" target="_blank">
                    <img class="rounded-full h-8 w-8" src="https://images.evetech.net/corporations/{user.main_character.corporation_id}/logo?size=32" alt="{user.main_character.corporation_name} logo">
                    <p>{user.main_character.corporation_name}</p>
                </a>
            </div>
        </div>
        {#if user.characters.length > 0}
            <div class="flex flex-col items-center">
                <p class="py-2 font-bold">Linked Characters</p>
                <ul class="border-t border-color w-full">
                    {#each user.characters as character}
                        <li class="border-b border-color py-2 flex justify-between">
                            <a href="https://zkillboard.com/character/{character.character_id}/" class="flex items-center gap-2 text-hover hover:invert-[0.04]" target="_blank">
                                <img class="rounded-full h-8 w-8" src="https://images.evetech.net/characters/{character.character_id}/portrait?size=32" alt="{character.character_name}'s portrait">
                                <span>{character.character_name}</span>
                            </a>
                            <a href="https://zkillboard.com/corporation/{character.corporation_id}/" class="flex items-center text-hover" target="_blank">
                                <span>{character.corporation_name}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </Card.Content>
</Card.Root>