import { mockData } from "../mocks/seedData";
import { getJson, postJson } from "./http";
import type { RepairTicket } from "../types/RepairTicket";
import type { DispatchCandidate } from "../types/DispatchCandidate";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await getJson<RepairTicket[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.repairTicket as unknown as RepairTicket[])];
  }
}

export function listDispatchCandidates(ticketId: number): Promise<DispatchCandidate[]> {
  return getJson<DispatchCandidate[]>(`${endpoint}/${ticketId}/candidates`);
}

export function dispatchRepairTicket(ticketId: number, crewId: number): Promise<RepairTicket> {
  return postJson<RepairTicket>(`${endpoint}/${ticketId}/dispatch`, { crew_id: crewId });
}

export function arriveRepairTicket(ticketId: number): Promise<RepairTicket> {
  return postJson<RepairTicket>(`${endpoint}/${ticketId}/arrive`);
}

export function startRepairTicket(ticketId: number): Promise<RepairTicket> {
  return postJson<RepairTicket>(`${endpoint}/${ticketId}/start-repair`);
}

export function restoreRepairTicket(ticketId: number, payload: { restore_result: string; restored_at?: string }): Promise<RepairTicket> {
  return postJson<RepairTicket>(`${endpoint}/${ticketId}/restore`, payload);
}

export function closeRepairTicket(ticketId: number): Promise<RepairTicket> {
  return postJson<RepairTicket>(`${endpoint}/${ticketId}/close`);
}
