<script lang="ts">
    import { createRender, createTable, Render, Subscribe, type Table as TableType, type Column, type HeaderRow, type BodyRow, type TableAttributes, type TableBodyAttributes} from "svelte-headless-table";
    import { readable, type Readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table";
	import { type ApplicationDto } from '$lib/model/application';
	import type { AnyPlugins } from "svelte-headless-table/plugins";
    
    import DataTableCharacter from "../table/data-table-character.svelte";
    import DataTableBoolean from "./data-table-boolean.svelte";
    import DataTableStatus from "./data-table-status.svelte";
    import DataTableLocation from "./data-table-location.svelte";
	import DataTableCorporation from "../table/data-table-corporation.svelte";
    import DataTableView from "../table/data-table-view.svelte";
	import DataTableQuestions from "./data-table-questions.svelte";

    export let applications: ApplicationDto[];

    let table: TableType<ApplicationDto, AnyPlugins>
    let columns: Column<ApplicationDto, AnyPlugins>[]
    let headerRows: Readable<HeaderRow<ApplicationDto, AnyPlugins>[]>
    let pageRows: Readable<BodyRow<ApplicationDto, AnyPlugins>[]>
    let tableAttrs: Readable<TableAttributes<ApplicationDto, AnyPlugins>>
    let tableBodyAttrs: Readable<TableBodyAttributes<ApplicationDto, AnyPlugins>>

    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    $: {
        table = createTable(readable(applications));
        columns = table.createColumns([
            table.column({
                accessor: ({user}) => user,
                header: 'Character',
                cell: ({value}) => {
                    return createRender(DataTableCharacter, {character_id: value.character_id, character_name: value.character_name, user_id: value.id});
                }
            }),
            table.column({
                accessor: ({user}) => user,
                header: 'Current Corporation',
                cell: ({value}) => {
                    return createRender(DataTableCorporation, {corporation_id: value.corporation_id, corporation_name: value.corporation_name});
                }
            }),
            table.column({
                accessor: ({reviewer}) => reviewer,
                header: 'Reviewed By',
                cell: ({value}) => {
                    if (value == null) {
                        return "N/A"
                    }
                    return createRender(DataTableCharacter, {character_id: value.character_id, character_name: value.character_name, user_id: value.id});
                }
            }),
            table.column({
                accessor: 'status',
                header: 'Status',
                cell: ({value}) => {
                    return createRender(DataTableStatus, {status: value});
                }
            }),
            table.column({
                accessor: 'location',
                header: 'Applying To',
                cell: ({value}) => {
                    return createRender(DataTableLocation, {location: value});
                }
            }),
            table.column({
                accessor: ({seat_completed}) => seat_completed,
                header: 'SeAT',
                cell: ({value}) => {
                    return createRender(DataTableBoolean, {bool: value});
                }
            }),
            table.column({
                accessor: ({discord_completed}) => discord_completed,
                header: 'Discord',
                cell: ({value}) => {
                    return createRender(DataTableBoolean, {bool: value});
                }
            }),
            table.column({
                accessor: ({questions}) => questions,
                header: 'Questions',
                cell: ({value}) => {
                    return createRender(DataTableQuestions, {questions: value});
                }
            }),
            table.column({
                accessor: ({last_updated}) => {
                    return formatDate(new Date(last_updated));
                },
                header: 'Last Updated',
            }),
            table.column({
                accessor: ({id}) => id,
                header: '',
                cell: ({value}) => {
                    return createRender(DataTableView, {href: `/admin/applications/${value}`});
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