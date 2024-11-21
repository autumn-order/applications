<script lang="ts">
	import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";

    export let bool: boolean;
</script>

{#if bool}
    <Fa icon={faCheck} class="text-green-700 dark:text-green-500"/>
{:else}
    <Fa icon={faTimes} class="text-red-700 dark:text-red-500"/>
{/if}