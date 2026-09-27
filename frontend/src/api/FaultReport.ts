import { mockTicketServer } from "../mocks/mockServer";
import { request } from "./http";
import type { FaultReport } from "../types/FaultReport";

const endpoint = "/fault-report";

export async function listFaultReport(): Promise<FaultReport[]> {
  try {
    return await request<FaultReport[]>(endpoint);
  } catch {
    return mockTicketServer.listReports();
  }
}

export async function saveFaultReport(payload: FaultReport): Promise<FaultReport> {
  console.info("save FaultReport", payload);
  return payload;
}
