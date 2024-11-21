<script lang="ts">
    import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
	import type { ApplicationQuestionsDto } from "$lib/model/application";

    export let questions: ApplicationQuestionsDto;
    let application_questions_complete = false;

    $: {
        if (
            questions.referrer !== null &&
            questions.region !== null &&
            questions.languages.length > 0 &&
            questions.interests.length > 0 &&
            questions.end_goals !== "" &&
            questions.why_autumn !== ""
        ) {
            application_questions_complete = true;
        }
    }
</script>

{#if application_questions_complete}
    <Fa icon={faCheck} class="text-green-700 dark:text-green-500"/>
{:else}
    <Fa icon={faTimes} class="text-red-700 dark:text-red-500"/>
{/if}