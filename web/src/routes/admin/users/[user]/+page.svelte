<script lang="ts">
	import { page } from "$app/stores";

    import User from "./user.svelte";
    import Roles from "./roles.svelte";
	import type { GetUsersDto, UserCharactersDto, UserDto } from "$lib/model/user";
	import { onMount } from "svelte";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import LoadingMessage from "$lib/components/messages/LoadingMessage.svelte";
	import ErrorMessage from "$lib/components/messages/ErrorMessage.svelte";
	import UserApplicationHistory from "$lib/components/admin/UserApplicationHistory.svelte";

    import { Permissions } from "$lib/model/permission";
	import type { Unsubscriber } from "svelte/store";
	import { getUser } from "$lib/stores/user";

    async function fetchUserData(user_id: number) {
        try {
            const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/users?page=${1}&limit=${1}&user_id=${user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const result: GetUsersDto = await response.json();

                if (result.users.length === 0) {
                    status_code = 404;
                    error_message = "User not found";
                } else {
                    userData = result.users[0];
                }
            } else {
                error_message = await response.text();
                status_code = response.status;
            }
        } catch (error) {
            error_message = 'Request timed out';
            status_code = 408;
        }
    }

    onMount(() => {
        let unsubscribe: Unsubscriber;

        const userStore = getUser();

        unsubscribe = userStore.subscribe(value => {
            if (value) {
                if (
                    value.permissions.includes(Permissions.ViewApplication) ||
                    value.permissions.includes(Permissions.Admin))
                {
                    user = value;
                } else if (value === null) {
                    status_code = 403;
                    error_message = "You do not have permission to access this page";
                }
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    });
    
    let userData: UserCharactersDto | undefined = undefined;

    let user_id: number = parseInt($page.params.user);
    
    let error_message = "";
    let status_code = 0;

    let user: UserDto | undefined | null = undefined; 

    $: user_id = parseInt($page.params.user);

    $: {
        if (user) {
            (async () => {
                if (!isNaN(user_id)) {
                    await fetchUserData(user_id);
                } else {
                    status_code = 400;
                    error_message = "User ID requested is not a number.";
                }
            })();
        }
    }

</script>

<section class="flex w-full flex-col pt-4 md:p-4">
    {#if error_message}
        <ErrorMessage status={status_code} message={error_message}/>
    {:else if userData === undefined}
        <LoadingMessage message="Loading user data..."/>
    {:else}
        <div class="flex flex-wrap">
            <div class="w-full md:w-1/2 md:pr-2">
                <User user={userData}/>
            </div>
            <div class="w-full pt-4 md:w-1/2 md:pt-0 md:pl-2">
                <Roles {user_id}/>
            </div>
        </div>
        <div class="pt-4">
            <UserApplicationHistory {user_id}/>
        </div>
    {/if}
</section>