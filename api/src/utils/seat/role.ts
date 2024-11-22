import { SeatRoleDetailsResponse, SeatRoleResponse } from "./model";

export async function fetchSeatRoles(page: number): Promise<SeatRoleResponse> {
  const seat_domain = process.env.SEAT_DOMAIN;
  const seat_application_key = process.env.SEAT_API_TOKEN;

  if (!seat_domain) {
    throw new Error("SEAT_DOMAIN not found in environment variables");
  }

  if (!seat_application_key) {
    throw new Error("SEAT_APPLICATION_KEY not found in environment variables");
  }

  const response = await fetch(
    `https://${seat_domain}/api/v2/roles?page=${page}`,
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
      `Failed to fetch seat roles with URL: ${response.status} | ${response.statusText}`,
    );
  }

  const json: SeatRoleResponse = await response.json();
  return json;
}

export async function fetchSeatRoleDetails(
  role_id: number,
): Promise<SeatRoleDetailsResponse> {
  const seat_domain = process.env.SEAT_DOMAIN;
  const seat_application_key = process.env.SEAT_API_TOKEN;

  if (!seat_domain) {
    throw new Error("SEAT_DOMAIN not found in environment variables");
  }

  if (!seat_application_key) {
    throw new Error("SEAT_APPLICATION_KEY not found in environment variables");
  }

  const response = await fetch(
    `https://${seat_domain}/api/v2/roles/${role_id}`,
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
      `Failed to fetch seat role details: ${response.status} | ${response.statusText}`,
    );
  }

  const json: SeatRoleDetailsResponse = await response.json();
  return json;
}
