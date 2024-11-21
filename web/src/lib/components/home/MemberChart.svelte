<script lang="ts">
	import { getCorporationStatsEntries } from '$lib/stores/stats';
    import { Line } from 'svelte-chartjs'
    import 'chart.js/auto';
    import { mode } from "mode-watcher";
	import { onMount } from 'svelte';

    let xAxis: string[] = [];
    let yAxis: number[] = [];

    $: graph_line_color = $mode === "light" ? "#92400e" : "#92400e";
    $: graph_grid_color = $mode === "light" ? "#d4d4d4" : "#171717";

    onMount(async () => {
        const AUTUMN_ORDER_CORPORATION_ID = 98785281;
        const AUTUMN_HIGHSEC_CORPORATION_ID = 98784256;

        const autumnOrderStats = await getCorporationStatsEntries(AUTUMN_ORDER_CORPORATION_ID);
        const autumnHighsecStats = await getCorporationStatsEntries(AUTUMN_HIGHSEC_CORPORATION_ID);

        const combinedStats = [...autumnOrderStats, ...autumnHighsecStats];

        const statsMap = new Map<string, number>();

        combinedStats.forEach(entry => {
            if (statsMap.has(entry.date)) {
                statsMap.set(entry.date, statsMap.get(entry.date)! + entry.members);
            } else {
                statsMap.set(entry.date, entry.members);
            }
        });

        const stats = Array.from(statsMap, ([date, members]) => ({ date, members }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        yAxis = stats.map(entry => entry.members);
        xAxis = stats
            .map(entry => {
                const date = new Date(entry.date);
                return date.toISOString().slice(0, 10)});
            })
</script>

<Line
    data={{
        labels: xAxis,
        datasets: [{
            label: "Autumn's Total Member Count",
            backgroundColor: graph_line_color,
            borderColor: graph_line_color,
            data: yAxis,
        }]
    }}
    options={{
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { maxTicksLimit: 7 },
                grid: { 
                    display: false,
                
                }
            },
            y: {
                grid: { 
                    color: graph_grid_color,    
                
                }
            }
        }
    }}
/>