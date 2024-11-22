import { SeatUser } from "./model";

export async function fetchSeatUser(user_id: number): Promise<SeatUser> {
  const seat_domain = process.env.SEAT_DOMAIN;
  const seat_application_key = process.env.SEAT_API_TOKEN;

  if (!seat_domain) {
    throw new Error("SEAT_DOMAIN not found in environment variables");
  }

  if (!seat_application_key) {
    throw new Error("SEAT_APPLICATION_KEY not found in environment variables");
  }

  const response = await fetch(
    `https://${seat_domain}/api/v2/users/${user_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-token": seat_application_key,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch seat user for user ID ${user_id}: ${response.status} | ${response.statusText}`,
    );
  }

  const json: SeatUser = await response.json();
  return json;
}
