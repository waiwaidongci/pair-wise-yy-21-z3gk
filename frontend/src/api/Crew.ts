import { mockData } from "../mocks/seedData";
import { getJson, postJson } from "./http";
import type { Crew } from "../types/Crew";
import type { RepairTicket } from "../types/RepairTicket";

const endpoint = "/api/crew";

export async function listCrew(): Promise<Crew[]> {
  try {
    return await getJson<Crew[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.crew as unknown as Crew[])];
  }
}

// 模拟班组刚被更紧急任务占用，用于演示派工冲突退回。
export function urgentOccupyCrew(crewId: number, payload: { fault_type: string; address_desc: string }): Promise<{ crew: Crew; ticket: RepairTicket }> {
  return postJson<{ crew: Crew; ticket: RepairTicket }>(`${endpoint}/${crewId}/urgent-occupy`, payload);
}
