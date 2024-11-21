import { USER_AGENT } from "../../constants";
import { EveCorporation } from "./model";

export async function getCorporationInfo(
  corporation_id: number,
): Promise<EveCorporation> {
  const user_agent: string = USER_AGENT();

  const result = await fetch(
    `https://esi.evetech.net/latest/corporations/${corporation_id}/`,
    {
      method: "GET",
      headers: {
        "user-agent": user_agent,
        "Content-Type": "application/json",
      },
    },
  );

  if (result.ok) {
    return await result.json();
  } else {
    throw new Error(
      `Failed to fetch corporation information: ${result.statusText}`,
    );
  }
}
