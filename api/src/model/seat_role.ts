import { UserCharactersDto, UserDto } from "./user";

export interface SeatRoleDto {
    id: number;
    seat_role_id: number;
    name: string;
    member_count: number;
}

export interface GetSeatRolesDto {
    roles: SeatRoleDto[];
    total: number;
}

export interface GetSeatRoleUsersDto {
    users: UserCharactersDto[];
    total: number;
}