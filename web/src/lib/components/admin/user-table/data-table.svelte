<script lang="ts">
    import { createRender, createTable, Render, Subscribe, type Table as TableType, type Column, type HeaderRow, type BodyRow, type TableAttributes, type TableBodyAttributes} from "svelte-headless-table";
    import { readable, type Readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table";
	import type { AnyPlugins } from "svelte-headless-table/plugins";
    
	import type { UserCharactersDto } from "$lib/model/user";
    import DataTableCharacter from "$lib/components/admin/table/data-table-character.svelte";
    import DataTableCorporation from "$lib/components/admin/table/data-table-corporation.svelte";
	import DataTableCharacters from "../../../../routes/admin/users/data-table-characters.svelte";
    import DataTableView from "$lib/components/admin/table/data-table-view.svelte";

    export let users: UserCharactersDto[];

    let table: TableType<UserCharactersDto, AnyPlugins>
    let columns: Column<UserCharactersDto, AnyPlugins>[]
    let headerRows: Readable<HeaderRow<UserCharactersDto, AnyPlugins>[]>
    let pageRows: Readable<BodyRow<UserCharactersDto, AnyPlugins>[]>
    let tableAttrs: Readable<TableAttributes<UserCharactersDto, AnyPlugins>>
    let tableBodyAttrs: Readable<TableBodyAttributes<UserCharactersDto, AnyPlugins>>

    $: {
        table = createTable(readable(users));
        columns = table.createColumns([
            table.column({
                accessor: ({main_character, id}) => ({main_character, id}),
                header: 'Main Character',
                cell: ({value}) => {
                    return createRender(DataTableCharacter, {character_id: value.main_character.character_id, character_name: value.main_character.character_name, user_id: value.id});
                }
            }),
            table.column({
                accessor: ({characters, main_character}) => ({characters, main_character}),
                header: 'Characters',
                cell: ({value}) => {
                    return createRender(DataTableCharacters, {characters: [value.main_character, ...value.characters]});
                }
            }),
            table.column({
                accessor: ({main_character}) => main_character,
                header: 'Corporation',
                cell: ({value}) => {
                    return createRender(DataTableCorporation, {corporation_id: value.corporation_id, corporation_name: value.corporation_name});
                }
            }),
            table.column({
                accessor: ({id}) => id,
                header: '',
                cell: ({value}) => {
                    return createRender(DataTableView, {href: `/admin/users/${value}`});
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