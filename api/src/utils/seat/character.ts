interface SeatUserResponse {
  data: {
    user_id: number;
  };
}

export default async function fetchSeatCharacterUserId(
  character_id: number,
): Promise<number | null> {
  const seat_domain = process.env.SEAT_DOMAIN;
  const seat_application_key = process.env.SEAT_APPLICATION_KEY;

  if (!seat_domain) {
    throw new Error("SEAT_DOMAIN not found in environment variables");
  }

  if (!seat_application_key) {
    throw new Error("SEAT_APPLICATION_KEY not found in environment variables");
  }

  const response = await fetch(
    `https://${seat_domain}/api/v2/character/sheet/${character_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-token": seat_application_key,
      },
    },
  );

  if (response.status === 401) {
    throw new Error("Invalid SeAT application key");
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch seat userID for character ${character_id}: ${response.status} | ${response.statusText}`,
    );
  }

  const json: SeatUserResponse = await response.json();
  return json.data.user_id;
}
