import { mockTicketServer } from "../mocks/mockServer";
import { request } from "./http";
import type { GridAsset } from "../types/GridAsset";

const endpoint = "/grid-asset";

export async function listGridAsset(): Promise<GridAsset[]> {
  try {
    return await request<GridAsset[]>(endpoint);
  } catch {
    return mockTicketServer.listAssets();
  }
}

export async function saveGridAsset(payload: GridAsset): Promise<GridAsset> {
  console.info("save GridAsset", payload);
  return payload;
}
