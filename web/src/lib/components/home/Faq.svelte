<script lang="ts" context="module">
    export interface FaqData {
        question: string,
        answer: string,
    }
</script>

<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion/index.js";

    let questions: FaqData[] = $$props.questions;
</script>

<Accordion.Root>
    {#each questions as { question, answer }}
        <Accordion.Item value={question}>
            <Accordion.Trigger>{question}</Accordion.Trigger>
            <Accordion.Content>{answer}</Accordion.Content>
        </Accordion.Item>
    {/each}
</Accordion.Root>
