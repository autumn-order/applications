<script lang="ts">
    import { createRender, createTable, Render, Subscribe, type Table as TableType, type Column, type HeaderRow, type BodyRow, type TableAttributes, type TableBodyAttributes} from "svelte-headless-table";
    import { readable, type Readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table";
	import type { AnyPlugins } from "svelte-headless-table/plugins";
    
    import DataTableView from "$lib/components/admin/table/data-table-view.svelte";
	import type { SeatRoleDto } from "$lib/model/seat_role";

    export let users: SeatRoleDto[];

    let table: TableType<SeatRoleDto, AnyPlugins>
    let columns: Column<SeatRoleDto, AnyPlugins>[]
    let headerRows: Readable<HeaderRow<SeatRoleDto, AnyPlugins>[]>
    let pageRows: Readable<BodyRow<SeatRoleDto, AnyPlugins>[]>
    let tableAttrs: Readable<TableAttributes<SeatRoleDto, AnyPlugins>>
    let tableBodyAttrs: Readable<TableBodyAttributes<SeatRoleDto, AnyPlugins>>

    $: {
        table = createTable(readable(users));
        columns = table.createColumns([
            table.column({
                accessor: 'name',
                header: 'Role',
            }),
            table.column({
                accessor: 'member_count',
                header: 'Members',
            }),
            table.column({
                accessor: ({id}) => id,
                header: '',
                cell: ({value}) => {
                    return createRender(DataTableView, {href: `/admin/roles/${value}`});
                }
            }),
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