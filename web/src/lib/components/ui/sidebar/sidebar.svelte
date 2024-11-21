<script lang="ts">
	import Fa from "svelte-fa";
    import { Button } from "../button";
	import { faBars } from "@fortawesome/free-solid-svg-icons";
	import { onDestroy, onMount } from "svelte";
	import { afterNavigate } from "$app/navigation";

    function handleClickOutside(event: any) {
        if (sidebar && !sidebar.contains(event.target)) {
            sidebar_open = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });

    afterNavigate(() => {
        sidebar_open = false;
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', handleClickOutside);
        }
    });

    let sidebar: HTMLLIElement | HTMLDivElement;
    let sidebar_open = false;
</script>

<div bind:this={sidebar} class="fixed h-screen lg:relative lg:h-auto primary-bg z-10">
    <div 
        class="{sidebar_open ? "" : "hidden"} h-full w-52 lg:w-52 lg:block border-color border-r"
    >
        <ul class="p-2">
            <slot/>
        </ul>
    </div>
    <div class="lg:hidden fixed">
        <Button class="m-2" variant="outline" size="icon" on:click={() => sidebar_open = !sidebar_open}>
            <Fa icon={faBars}/>
        </Button>
    </div>
</div>