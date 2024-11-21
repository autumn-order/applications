import type { CharacterDto } from "./character";
import type { Permissions } from "./permission";

export interface UserDto {
    id: number;
    character_id: number;
    character_name: string;
    corporation_id: number;
    corporation_name: string;
    permissions: Permissions[];
}

export interface UserCharactersDto {
    id: number;
    main_character: CharacterDto;
    characters: CharacterDto[];
}

export interface GetUsersDto {
    users: UserCharactersDto[];
    total: number;
}

export interface UserFilters {
    character?: string;
}

export interface UserRoleDto {
    id: number;
    seat_role_id: number;
    seat_role_name: string;
}

export interface GetUserRolesDto {
    roles: UserRoleDto[];
    total: number;
}