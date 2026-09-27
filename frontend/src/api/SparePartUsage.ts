import { mockData } from "../mocks/seedData";
import { request } from "./http";
import type { SparePartUsage } from "../types/SparePartUsage";

const endpoint = "/spare-part-usage";

export async function listSparePartUsage(): Promise<SparePartUsage[]> {
  try {
    return await request<SparePartUsage[]>(endpoint);
  } catch {
    return [...mockData.sparePartUsage];
  }
}

export async function saveSparePartUsage(payload: SparePartUsage): Promise<SparePartUsage> {
  console.info("save SparePartUsage", payload);
  return payload;
}
