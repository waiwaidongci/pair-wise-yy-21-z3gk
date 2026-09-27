import { mockTicketServer } from "../mocks/mockServer";
import { request } from "./http";
import type { Crew } from "../types/Crew";

const endpoint = "/crew";

export async function listCrew(): Promise<Crew[]> {
  try {
    return await request<Crew[]>(endpoint);
  } catch {
    return mockTicketServer.listCrew();
  }
}

export async function saveCrew(payload: Crew): Promise<Crew> {
  console.info("save Crew", payload);
  return payload;
}
