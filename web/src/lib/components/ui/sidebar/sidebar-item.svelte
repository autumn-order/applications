<script lang="ts">
	import type { IconDefinition as SolidIconDefinition } from "@fortawesome/free-solid-svg-icons";
    import type { IconDefinition as BrandIconDefinition } from "@fortawesome/free-brands-svg-icons";
	import Fa from "svelte-fa";
	import { page } from "$app/stores";

    let icon: SolidIconDefinition | BrandIconDefinition = $$props.icon;
    let text: string = $$props.text;
    let href: string = $$props.href;

    // if current page === href then add active class
    let active = false;

    $: active = $page.url.pathname === href;
</script>


<li>
    <a href={href} class="">
        <div class="flex gap-2 items-center p-2 {active ? "bg-neutral-400 dark:bg-neutral-900" : ""} rounded">
            <Fa class="h-6 w-6" icon={icon} />
            <span>{text}</span>
        </div>
    </a>
</li>