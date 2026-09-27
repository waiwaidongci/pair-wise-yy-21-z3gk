import { mockData } from "../mocks/seedData";
import { getJson, postJson } from "./http";
import type { FaultReport } from "../types/FaultReport";
import type { RepairTicket } from "../types/RepairTicket";

const endpoint = "/api/fault-report";

export interface RegisterReportResult {
  merged: boolean;
  report: FaultReport;
  ticket: RepairTicket;
}

export async function listFaultReport(): Promise<FaultReport[]> {
  try {
    return await getJson<FaultReport[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.faultReport as unknown as FaultReport[])];
  }
}

// 值班员登记来电：服务端自动判断是否并入最早待派工单。
export function registerFaultReport(payload: {
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
}): Promise<RegisterReportResult> {
  return postJson<RegisterReportResult>(`${endpoint}/register`, payload);
}
