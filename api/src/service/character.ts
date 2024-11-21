import CharacterRepository, { DbCharacter } from "../data/character";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import {
  getCharacterAffiliations,
  getCharacterInfo,
} from "../utils/eve/character";
import { createEveCorporation } from "./corporation";

export async function updateCharacterAffiliations(
  db: BetterSQLite3Database<Record<string, never>>,
  character_ids: number[],
): Promise<DbCharacter[]> {
  const characterRepository = new CharacterRepository(db);

  const characters = await characterRepository.get({
    character_ids: character_ids,
  });

  const ONE_HOUR_IN_MS = 3600000;
  const oneHourAgo = new Date(Date.now() - ONE_HOUR_IN_MS).toISOString();

  const unique_outdated_character_ids = Array.from(
    new Set(
      characters
        .filter((c) => c.character.last_updated < oneHourAgo)
        .map((c) => c.character.character_id),
    ),
  );

  const affiliations = await getCharacterAffiliations(
    unique_outdated_character_ids,
  );

  const updated_characters: DbCharacter[] = [];

  for (const affiliation of affiliations) {
    const character = characters.find(
      (c) => c.character.character_id === affiliation.character_id,
    );

    if (!character) {
      // TODO: may need to delete this char from database assuming they've been deleted from ESI, more likely just invalid char ID though
      continue;
    }

    if (character.character.corporation_id === affiliation.corporation_id) {
      continue;
    }

    const result = await characterRepository.update(character.character);

    if (!result) {
      console.error(
        `Failed to update character ${character.character.character_id}'s affiliations.`,
      );
      continue;
    }

    updated_characters.push(result);
  }

  return updated_characters;
}

export async function createEveCharacter(
  db: BetterSQLite3Database<Record<string, never>>,
  character_id: number,
  character_name?: string,
): Promise<DbCharacter> {
  const characterRepository = new CharacterRepository(db);

  const character = await characterRepository.get({ character_id });

  if (character.length > 0) {
    return character[0].character;
  }

  const affiliations = await getCharacterAffiliations([character_id]);

  if (affiliations.length === 0) {
    throw new Error(
      `Failed to fetch affiliations for character ${character_id}`,
    );
  }

  await createEveCorporation(db, affiliations[0].corporation_id);

  if (!character_name) {
    character_name = (await getCharacterInfo(character_id)).name;
  }

  const new_character = await characterRepository.create({
    character_id,
    character_name: character_name,
    corporation_id: affiliations[0].corporation_id,
  });

  if (!new_character) {
    throw new Error(`Failed to create character ${character_id}`);
  }

  return new_character;
}
