import { seed } from "../seed";
import type { GridAsset } from "../models/GridAsset";
import type { FaultReport } from "../models/FaultReport";
import type { RepairTicket } from "../models/RepairTicket";
import type { Crew } from "../models/Crew";
import type { SparePartUsage } from "../models/SparePartUsage";

// 进程内可变数据源：替代 MySQL 的内存表，所有 repository 共享同一份状态
interface Tables {
  gridAsset: GridAsset[];
  faultReport: FaultReport[];
  repairTicket: RepairTicket[];
  crew: Crew[];
  sparePartUsage: SparePartUsage[];
}

export const db: Tables = {
  gridAsset: seed.gridAsset.map((row) => ({ ...row })),
  faultReport: seed.faultReport.map((row) => ({ ...row })),
  repairTicket: seed.repairTicket.map((row) => ({ ...row, merged_report_ids: [...row.merged_report_ids], events: row.events.map((e) => ({ ...e })) })),
  crew: seed.crew.map((row) => ({ ...row, skill_tags: [...row.skill_tags] })),
  sparePartUsage: seed.sparePartUsage.map((row) => ({ ...row }))
};

export const nextId = (rows: { id: number }[]): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
