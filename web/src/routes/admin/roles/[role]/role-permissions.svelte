<script lang="ts" context="module"> 
    export interface PermissionsKv {
        key: string;
        value: Permissions;
    }
</script>

<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Select from "$lib/components/ui/select";
    import Table from "./permissions-table.svelte";
    import type { Selected } from "bits-ui";

	import { PUBLIC_VITE_BACKEND_URL } from "$env/static/public";
	import { Permissions, type RolePermissionsDto } from "$lib/model/permission";
	import { onMount } from "svelte";
	import { mapEnumArrayToPairs } from "$lib/utils";
	import type { UserDto } from "$lib/model/user";

    async function getRolePermissions(seat_role_id: number, page: number): Promise<RolePermissionsDto> {
        let request = `${PUBLIC_VITE_BACKEND_URL}/admin/roles/${seat_role_id}/permissions?page=${page}&limit=${entries_per_page}`;

        const response = await fetch(request, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            return {
                permissions: [],
                total: 0
            };
        }

        const result: RolePermissionsDto = await response.json();

        return result;
    }

    async function postRolePermissions(seat_role_id: number, permissions: Permissions[]): Promise<RolePermissionsDto> {
        let request = `${PUBLIC_VITE_BACKEND_URL}/admin/roles/${seat_role_id}/permissions`;

        const response = await fetch(request, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(permissions)
        });

        if (!response.ok) {
            return {
                permissions: [],
                total: 0
            };
        }

        const result: RolePermissionsDto = await response.json();

        return result;
    }

    async function handleSelectPermission(object: Selected<PermissionsKv> | undefined) {
        const permission = object?.value;

        if (permission) {
            if (!rolePermissionsData.permissions.includes(permission.value)) {
                const permissions = [...rolePermissionsData.permissions, permission.value];

                rolePermissionsData = await postRolePermissions(seat_role_id, permissions);
            }
        }
    }

    async function removePermission(permission: PermissionsKv) {
        if (rolePermissionsData.permissions.includes(permission.value)) {
            const permissions = rolePermissionsData.permissions.filter(item => item !== permission.value);

            rolePermissionsData = await postRolePermissions(seat_role_id, permissions);
        }
    }

    onMount(async () => {
        rolePermissionsData = await getRolePermissions(seat_role_id, page)
    });

    export let seat_role_id: number;
    export let user: UserDto | undefined | null = undefined; 

    const entries_per_page = 10;
    let page = 1;
    let rolePermissionsData: RolePermissionsDto = {
        permissions: [],
        total: 0
    };

    let permissions: PermissionsKv[] = Object.entries(Permissions).map(([key, value]) => ({ key, value }));
    let selectedPermissions: PermissionsKv[] = [];

    $: selectedPermissions =  mapEnumArrayToPairs(Permissions, rolePermissionsData.permissions);

    $: permissions = Object.entries(Permissions)
        .map(([key, value]) => ({ key, value }))
        .filter(permission => !selectedPermissions.some(selected => selected.value === permission.value));

</script>

<Card.Root class="h-full">
    <Card.Header class="pb-4 border-b border-color">
        <Card.Title class="text-xl">Role Permissions</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <div class="flex gap-2 ">
            {#if user && user.permissions.includes(Permissions.Admin)}
                <Select.Root portal={null} onSelectedChange={handleSelectPermission}>
                    <Select.Trigger class="w-48 h-8">
                        <Select.Value placeholder="Add Permission"/>
                    </Select.Trigger>
                    <Select.Content>
                        {#each permissions as permission}
                            <Select.Item value={permission}>{permission.value}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            {/if}
        </div>
        <Table permissions={rolePermissionsData.permissions} {removePermission} {user}/>
    </Card.Content>
    <Card.Footer class="flex justify-between gap-2 flex-wrap">
        <p class="w-1/2">Permissions: {rolePermissionsData.total}</p>
    </Card.Footer>
</Card.Root>