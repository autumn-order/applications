<script lang="ts">
    import { createRender, createTable, Render, Subscribe, type Table as TableType, type Column, type HeaderRow, type BodyRow, type TableAttributes, type TableBodyAttributes} from "svelte-headless-table";
    import { readable, type Readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table";
	import type { AnyPlugins } from "svelte-headless-table/plugins";
	import DataTableView from "$lib/components/admin/table/data-table-view.svelte";
	import type { UserRoleDto } from "$lib/model/user";

    export let roles: UserRoleDto[];

    let table: TableType<UserRoleDto, AnyPlugins>
    let columns: Column<UserRoleDto, AnyPlugins>[]
    let headerRows: Readable<HeaderRow<UserRoleDto, AnyPlugins>[]>
    let pageRows: Readable<BodyRow<UserRoleDto, AnyPlugins>[]>
    let tableAttrs: Readable<TableAttributes<UserRoleDto, AnyPlugins>>
    let tableBodyAttrs: Readable<TableBodyAttributes<UserRoleDto, AnyPlugins>>

    $: {
        table = createTable(readable(roles));
        columns = table.createColumns([
            table.column({
                accessor: 'seat_role_name',
                header: 'Role Name',
            }),
            table.column({
                accessor: (value) => value,
                header: 'Action',
                cell: ({value}) => {
                    return createRender(DataTableView, {href: `/admin/roles/${value.seat_role_id}`});
                }
            })
        ]);

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