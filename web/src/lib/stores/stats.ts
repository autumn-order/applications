import { get, writable } from 'svelte/store'

import type { CorporationStatsDto, StatsDto, StatsEntryDto, StatsRequestDto } from '$lib/model/stats'
import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public'

const STATS_STORE = writable<StatsDto | undefined>(undefined)
let fetchPromise: Promise<StatsDto> | null = null;

const fetchStats = async (): Promise<StatsDto> => {
    const body: StatsRequestDto = {
        statsCorporationIds: [98785281, 98784256],
        statsHistoryCorporationIds: [98785281, 98784256]
    }

    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/join/stats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const result: StatsDto = await response.json();
    return result;
}

const getStats = async (): Promise<StatsDto> => {
    let stats = get(STATS_STORE);

    if (stats === undefined) {
        if (!fetchPromise) {
            fetchPromise = fetchStats();
        }
        stats = await fetchPromise;
        STATS_STORE.set(stats);
        fetchPromise = null; // Reset the promise after fetching
    }

    return stats;
}

export const getCorporationStats = async (corporation_id: number): Promise<CorporationStatsDto | undefined> => {
    const stats = await getStats();
    return stats.corporation_stats.find((corporationStats) => corporationStats.corporation_id === corporation_id);
}

export const getCorporationStatsEntries = async (corporation_id: number): Promise<StatsEntryDto[]> => {
    const stats = await getStats();
    const corporationStats = stats.corporation_stats_entries.find((corporationStats) => corporationStats.corporation_id === corporation_id);
    return corporationStats?.entries || [];
}