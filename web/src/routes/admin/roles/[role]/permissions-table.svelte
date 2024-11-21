<script lang="ts">
    import { createRender, createTable, Render, Subscribe, type Table as TableType, type Column, type HeaderRow, type BodyRow, type TableAttributes, type TableBodyAttributes} from "svelte-headless-table";
    import { readable, type Readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table";
	import type { AnyPlugins } from "svelte-headless-table/plugins";
    import { Permissions } from "$lib/model/permission";
	import { mapEnumArrayToPairs } from "$lib/utils";
	import PermissionsTableAction from "./permissions-table-action.svelte";
    import type { PermissionsKv } from "./role-permissions.svelte";
	import type { UserDto } from "$lib/model/user";

    function sortPermissions(permissions: Permissions[]): Permissions[] {
        const permissionsOrder = Object.fromEntries(Object.values(Permissions).map((value, index) => [value, index]));
        return permissions.sort((a, b) => permissionsOrder[a] - permissionsOrder[b]);
    }

    export let permissions: Permissions[];
    export let removePermission: Function;
    export let user: UserDto | undefined | null = undefined; 

    let permissionsKv: PermissionsKv[] = [];

    $: {
        const sorted_permissions = sortPermissions(permissions);

        permissionsKv = mapEnumArrayToPairs(Permissions, sorted_permissions);
    }

    let table: TableType<PermissionsKv, AnyPlugins>
    let columns: Column<PermissionsKv, AnyPlugins>[]
    let headerRows: Readable<HeaderRow<PermissionsKv, AnyPlugins>[]>
    let pageRows: Readable<BodyRow<PermissionsKv, AnyPlugins>[]>
    let tableAttrs: Readable<TableAttributes<PermissionsKv, AnyPlugins>>
    let tableBodyAttrs: Readable<TableBodyAttributes<PermissionsKv, AnyPlugins>>

    $: {
        table = createTable(readable(permissionsKv));
        columns = table.createColumns([
            table.column({
                accessor: 'value',
                header: 'Permission',
            }),
        ]);

        if (user && user.permissions.includes(Permissions.Admin)) {
            columns = columns = [
                ...columns,
                table.column({
                    accessor: (value) => value,
                    header: 'Action',
                    cell: ({value}) => {
                        return createRender(PermissionsTableAction, {permission: value, removePermission});
                    }
                })
            ];
        }

        ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));
    }
</script>

<div class="rounded-md border border-color w-full">
    <Table.Root {...$tableAttrs}>
        <Table.Header>
            {#each $headerRows as headerRow}
                <Subscribe rowAttrs={headerRows}>
                    <Table.Row>
                        {#each headerRow.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                                <Table.Head {...attrs}>
                                    <Render of={cell.render()}/>
                                </Table.Head>
                            </Subscribe>
                        {/each}
                    </Table.Row>
                </Subscribe>
            {/each}  
        </Table.Header>
        <Table.Body {...$tableBodyAttrs} class="text-xs sm:text-sm">
            {#each $pageRows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                    <Table.Row {...rowAttrs}>
                        {#each row.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <Table.Cell {...attrs}>
                                    <Render of={cell.render()}/>
                                </Table.Cell>
                            </Subscribe>
                        {/each}
                    </Table.Row>
                </Subscribe>
            {/each}
        </Table.Body>
    </Table.Root>
</div>