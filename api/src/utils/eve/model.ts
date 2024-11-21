export interface EveCharacterAffiliation {
    alliance_id: number;
    character_id: number;
    corporation_id: number;
    faction_id: number;
}

export interface EveCorporation {
    alliance_id?: number;
    ceo_id: number;
    creator_id: number;
    date_founded?: string;
    description?: string;
    faction_id?: number;
    home_station_id?: number;
    member_count: number;
    name: string;
    shares?: number;
    tax_rate: number;
    ticker: string;
    url?: string;
    war_eligible?: boolean;
}

export interface EveCharacterInfo {
    alliance_id?: number;
    birthday: string;
    bloodline_id: number;
    corporation_id: number;
    description?: string;
    faction_id?: number
    gender: string;
    name: string;
    race_id: number;
    security_status?: number;
    title?: string;
}