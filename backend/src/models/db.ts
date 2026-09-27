// 内存数据存储：种子数据在此处被深拷贝为可变状态，供 repository 层读写。
// 各集合直接以模型接口为类型，避免种子字面量的只读推导扩散到业务层。
import { seed as rawSeed } from "../seed";
import type { GridAsset } from "./GridAsset";
import type { FaultReport } from "./FaultReport";
import type { RepairTicket } from "./RepairTicket";
import type { Crew } from "./Crew";
import type { SparePartUsage } from "./SparePartUsage";
import type { AuditLog } from "./AuditLog";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const db = {
  gridAsset: clone(rawSeed.gridAsset) as unknown as GridAsset[],
  faultReport: clone(rawSeed.faultReport) as unknown as FaultReport[],
  repairTicket: clone(rawSeed.repairTicket) as unknown as RepairTicket[],
  crew: clone(rawSeed.crew) as unknown as Crew[],
  sparePartUsage: clone(rawSeed.sparePartUsage) as unknown as SparePartUsage[],
  auditLog: clone(rawSeed.auditLog) as unknown as AuditLog[]
};

export type Db = typeof db;
