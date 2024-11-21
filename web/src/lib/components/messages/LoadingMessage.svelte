<script lang="ts">
    export let message: string;
</script>

<div class="flex flex-col gap-2 justify-center items-center w-full h-full">
    <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-color"></div>
    <p>{message}</p>
</div>