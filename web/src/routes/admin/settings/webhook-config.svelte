<script lang="ts">
	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import type { DiscordWebhooksDto } from "$lib/model/settings";
    import { faArrowsRotate, faTimes } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    const initializeWebhooks = (data: Partial<DiscordWebhooksDto>): DiscordWebhooksDto => {
        return {
            discord_webhook_new_application: data.discord_webhook_new_application || '',
            discord_webhook_application_accepted: data.discord_webhook_application_accepted || '',
            discord_webhook_application_rejected: data.discord_webhook_application_rejected || '',
            discord_webhook_applicant_joined: data.discord_webhook_applicant_joined || '',
            discord_webhook_application_expired: data.discord_webhook_application_expired || '',
            discord_webhook_application_ready_for_review: data.discord_webhook_application_ready_for_review || ''
        };
    };

    async function postWebhooks() {
        const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

        for (const key in webhooks) {
            if (webhooks.hasOwnProperty(key)) {
                const value = webhooks[key as keyof DiscordWebhooksDto];
                
                if (value !== "" && !webhookRegex.test(value)) {
                    const keytext = key.replace(/_/g, " ").replace("discord webhook", "").replace(/\b\w/g, char => char.toUpperCase());

                    banner_text = `Invalid webhook URL for ${keytext}`;
                    banner_success = false;
                    return;
                }
            }
        }

        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/settings/webhooks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(webhooks),
            credentials: "include",
        });

        if (response.ok) {
            banner_text = "Webhooks saved successfully!";
            banner_success = true;

            const result: DiscordWebhooksDto = initializeWebhooks(await response.json());

            saved_webhooks = {...result};
            webhooks = {...result};
            unsavedChanges = false;
        } else {
            const error_message = await response.text();
            banner_text = error_message;
            banner_success = false;
        }
    }

    async function testWebhook(key: keyof DiscordWebhooksDto) {
        const value = webhooks[key];

        const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

        if (value === "" || !webhookRegex.test(value)) {
            const keytext = key.replace(/_/g, " ").replace("discord webhook", "").replace(/\b\w/g, char => char.toUpperCase());
            banner_text = `Invalid webhook URL for ${keytext}`;
            banner_success = false;
            return;
        }

        const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/settings/webhooks/test`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ [key]: value }),
            credentials: "include",
        });

        if (response.ok) {
            const discordWebhookDescriptions = {
                "discord_webhook_new_application": "New Application",
                "discord_webhook_applicant_accepted": "Applicant Accepted",
                "discord_webhook_applicant_rejected": "Applicant Rejected",
                "discord_webhook_applicant_joined": "Applicant Joined",
                "discord_webhook_application_expired": "Application Expired",
                "discord_webhook_application_review_ready": "Application Ready for Review"
            };

            const description = discordWebhookDescriptions[key as keyof typeof discordWebhookDescriptions] || "Unknown Webhook";

            banner_text = `Webhook test successful for ${description}!`;
            banner_success = true;
        } else {
            const error_message = await response.text();
            banner_text = error_message;
            banner_success = false;
        }
    }

    function handleInput(event: InputEvent, key: keyof DiscordWebhooksDto) {
        const target = event.target as HTMLInputElement;
        webhooks[key] = target.value;
    }

    export let saved_webhooks: DiscordWebhooksDto;
    export let webhooks: DiscordWebhooksDto;

    let banner_text: string = "";
    let banner_success: boolean = true;

    let unsavedChanges = false;
    $: unsavedChanges = (
        saved_webhooks.discord_webhook_new_application !== webhooks.discord_webhook_new_application ||
        saved_webhooks.discord_webhook_application_accepted !== webhooks.discord_webhook_application_accepted ||
        saved_webhooks.discord_webhook_application_rejected !== webhooks.discord_webhook_application_rejected ||
        saved_webhooks.discord_webhook_applicant_joined !== webhooks.discord_webhook_applicant_joined ||
        saved_webhooks.discord_webhook_application_expired !== webhooks.discord_webhook_application_expired ||
        saved_webhooks.discord_webhook_application_ready_for_review !== webhooks.discord_webhook_application_ready_for_review
    );
</script>

<Card.Root>
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Manage Discord Webhooks</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
        <div class="flex justify-between items-center w-full rounded mb-2 p-2 {banner_text !== "" ? "" : "hidden"} {banner_success ? "bg-green-700" : "bg-red-700"}">
            <span class="text-white">{banner_text}</span>
            <Button size="icon" variant="outline" class="w-5 h-5" on:click={() => banner_text = ""}>
                <Fa icon={faTimes}/>
            </Button>
        </div>
        <p>Configure the webhooks to determine what channels Discord notifications are posted to, if no webhook is set then a notification won't be posted anywhere.</p>
        <ul class="flex flex-col gap-2">
            <li class="flex flex-col gap-2">
                <span>New Application</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_new_application")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_new_application} on:input={(event) => handleInput(event, "discord_webhook_new_application")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_new_application = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>                
                <div>

                </div>
            </li>
            <li class="flex flex-col gap-2">
                <span>Application Ready for Review</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_application_ready_for_review")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_application_ready_for_review} on:input={(event) => handleInput(event, "discord_webhook_application_ready_for_review")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_application_ready_for_review = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>
            </li>
            <li class="flex flex-col gap-2">
                <span>Application Accepted</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_application_accepted")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_application_accepted} on:input={(event) => handleInput(event, "discord_webhook_application_accepted")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_application_accepted = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>
            </li>
            <li class="flex flex-col gap-2">
                <span>Application Rejected</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_application_rejected")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_application_rejected} on:input={(event) => handleInput(event, "discord_webhook_application_rejected")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_application_rejected = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>
            </li>
            <li class="flex flex-col gap-2">
                <span>Application Expired</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_application_expired")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_application_expired} on:input={(event) => handleInput(event, "discord_webhook_application_expired")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_application_expired = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>
            </li>
            <li class="flex flex-col gap-2">
                <span>Applicant Joined</span>
                <div class="flex gap-2 items-center">
                    <Button variant="outline" on:click={() => testWebhook("discord_webhook_applicant_joined")}>Test</Button>
                    <Input bind:value={webhooks.discord_webhook_applicant_joined} on:input={(event) => handleInput(event, "discord_webhook_applicant_joined")}/>
                    <Button size="icon" variant="outline" class="w-9 h-9" on:click={() => webhooks.discord_webhook_applicant_joined = ""}>
                        <Fa icon={faTimes}/>
                    </Button>
                </div>
            </li>
        </ul>
    </Card.Content>
    <Card.Footer class="flex-col">
        <span class="text-red-700 h-6">
            {#if unsavedChanges}
            You have unsaved changes
            {/if}
        </span>
        <div class="flex justify-between w-full">
            <Button on:click={() => postWebhooks()}>Save Settings</Button>
            <Button variant="outline" class="flex gap-2" on:click={() => webhooks = {...saved_webhooks}}>
                <Fa icon={faArrowsRotate}/>
                <span>Reset</span>
            </Button>
        </div>
    </Card.Footer>
</Card.Root>