<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { faEye } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";

    export let href: string;
</script>

<div>
    <a href="{href}">
        <Button variant="outline" size="icon">
            <Fa icon={faEye} />
        </Button>
    </a>
</div>