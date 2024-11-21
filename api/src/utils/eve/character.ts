import { USER_AGENT } from "../../constants";
import { EveCharacterAffiliation, EveCharacterInfo } from "./model";

export async function getCharacterAffiliations(
  character_ids: number[],
): Promise<EveCharacterAffiliation[]> {
  const user_agent: string = USER_AGENT();

  const response = await fetch(
    "https://esi.evetech.net/latest/characters/affiliation/",
    {
      method: "POST",
      headers: {
        "user-agent": user_agent,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(character_ids),
    },
  );

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(
      `Failed to fetch character affiliations: ${response.statusText}`,
    );
  }
}

export async function getCharacterInfo(
  character_id: number,
): Promise<EveCharacterInfo> {
  const user_agent: string = USER_AGENT();

  const response = await fetch(
    `https://esi.evetech.net/latest/characters/${character_id}/`,
    {
      method: "GET",
      headers: {
        "user-agent": user_agent,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(
      `Failed to fetch character info for character_id ${character_id}: ${response.statusText}`,
    );
  }
}
