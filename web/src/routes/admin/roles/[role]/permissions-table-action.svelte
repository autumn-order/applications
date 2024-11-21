<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import Fa from "svelte-fa";
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
    import type { PermissionsKv } from "./role-permissions.svelte";

    export let permission: PermissionsKv;
    export let removePermission: Function;

</script>

<div>
    <Button variant="outline" size="icon" on:click={() => removePermission(permission)}>
        <Fa icon={faTimes} />
    </Button>
</div>