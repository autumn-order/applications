export interface SeatRole {
    id: number;
    title: string;
    description: string;
    logo: string;
}

export interface Links {
    first: string;
    last: string;
    prev: string;
    next: string;
}

export interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface SeatRoleResponse {
    data: SeatRole[];
    links: Links;
    meta: Meta;
}

export interface SeatRoleDetails {
    title: string;
    description: string;
    logo: string;
    permissions: {
        title: string;
        filters: Record<string, unknown>;
    }[];
    members: number[];
    squads: number[];
}

export interface SeatRoleDetailsResponse {
    data: SeatRoleDetails;
}

export interface SeatUser {
    id: number;
    name: string;
    email: string;
    active: boolean;
    last_login: string;
    last_login_source: string;
    associated_character_ids: number[];
    main_character_id: number;
}