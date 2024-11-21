<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import LoadingMessage from "$lib/components/messages/LoadingMessage.svelte";
	import ErrorMessage from "$lib/components/messages/ErrorMessage.svelte";
	import type { GetSeatRolesDto, SeatRoleDto } from "$lib/model/seat_role";
	import RoleSummary from "./role-summary.svelte";
	import RolePermissions from "./role-permissions.svelte";
	import RoleMembers from "./role-members.svelte";

    import { Permissions } from "$lib/model/permission";
	import type { Unsubscriber } from "svelte/store";
	import { getUser } from "$lib/stores/user";
	import type { UserDto } from "$lib/model/user";

    async function fetchRoleData(role_id: number) {
        try {
            const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/admin/roles?page=${1}&limit=${1}&id=${role_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const result: GetSeatRolesDto = await response.json();

                if (result.roles.length === 0) {
                    status_code = 404;
                    error_message = "Role not found";
                } else {
                    role = result.roles[0];
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

    let role: SeatRoleDto | undefined = undefined;

    let role_id: number = parseInt($page.params.role);

    let error_message = "";
    let status_code = 0;

    let user: UserDto | undefined | null = undefined; 

    $: role_id = parseInt($page.params.role);

    $: {
        if (user) {
            (async () => {
                if (!isNaN(role_id)) {
                    await fetchRoleData(role_id);
                } else {
                    status_code = 400;
                    error_message = "Role ID requested is not a number.";
                }
            })();
        }
    }
</script>

<section class="flex w-full flex-col pt-4 md:p-4">
    {#if error_message}
        <ErrorMessage status={status_code} message={error_message}/>
    {:else if role === undefined}
        <LoadingMessage message="Loading role info"/>
    {:else}
        <div class="flex flex-wrap">
            <div class="w-full md:w-1/2 md:pr-2">
                <RoleSummary {role}/>
            </div>
            <div class="w-full pt-4 md:w-1/2 md:pt-0 md:pl-2">
                <RolePermissions {user} seat_role_id={role.seat_role_id}/>
            </div>
        </div>
        <div class="w-full pt-4">
            <RoleMembers seat_role_id={role.seat_role_id}/>
        </div>
    {/if}
</section>