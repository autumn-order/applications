<script lang="ts">
    export let status: number;
    export let message: string;
</script>

<div class="w-full h-full flex flex-col lg:flex-row justify-center items-center">
    <h1 class="text-4xl border-color lg:pr-2 lg:mr-2 lg:border-r">{status}</h1>
    <p class="text-2xl">{message}</p>
</div>