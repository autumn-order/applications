import { DbCharacter } from "../data/character";
import { DbCorporation } from "../data/corporation";
import { Permissions } from "../model/permission";
import { UserDto } from "../model/user";

export default function convertUserToDto(
  user_id: number,
  character: DbCharacter,
  corporation: DbCorporation,
  permissions?: Permissions[],
): UserDto {
  return {
    id: user_id,
    character_id: character.character_id,
    character_name: character.character_name,
    corporation_id: corporation.corporation_id,
    corporation_name: corporation.corporation_name,
    permissions: permissions ?? [],
  };
}
