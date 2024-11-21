<script lang="ts">
	import { ApplicationStatus } from "$lib/model/application";

    export let status: ApplicationStatus;

    let text_color = "";

    $: {
        switch (status) {
            case ApplicationStatus.Pending:
                text_color = "text-yellow-700 dark:text-yellow-500";
                break;
            case ApplicationStatus.Rejected:
                text_color = "text-red-700 dark:text-red-500";
                break;
            case ApplicationStatus.Accepted:
                text_color = "text-green-700 dark:text-green-500";
                break;
            case ApplicationStatus.Joined:
                text_color = "text-blue-700 dark:text-blue-500";
                break;
            case ApplicationStatus.Expired:
                text_color = "text-gray-700 dark:text-gray-500";
                break;
            case ApplicationStatus.Cancelled:
                text_color = "text-gray-700 dark:text-gray-500";
                break;
        }
    }

</script>

<span class="{text_color}">{status}</span>