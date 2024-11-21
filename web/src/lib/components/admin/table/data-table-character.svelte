<script lang="ts">
    export let character_id: number;
    export let character_name: string;
    export let user_id: number;
</script>

<div>
    <a class="flex gap-2 min-w-32 items-center text-hover hover:invert-[0.10]"  href="/admin/users/{user_id}">
        <img class="rounded-full w-8 h-8" src="https://images.evetech.net/characters/{character_id}/portrait?size=32" alt="{character_name} portrait"/>
        <p>{character_name}</p>
    </a>
</div>