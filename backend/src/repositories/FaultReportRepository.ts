import { db, nextId } from "./db";
import type { FaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll(): FaultReport[] {
    return db.faultReport;
  },
  findById(id: number): FaultReport | undefined {
    return db.faultReport.find((row) => row.id === id);
  },
  insert(row: FaultReport): FaultReport {
    db.faultReport.push(row);
    return row;
  },
  update(id: number, patch: Partial<FaultReport>): FaultReport {
    const row = this.findById(id);
    if (!row) throw new Error(`fault report ${id} not found`);
    Object.assign(row, patch);
    return row;
  },
  nextId(): number {
    return nextId(db.faultReport);
  }
};
