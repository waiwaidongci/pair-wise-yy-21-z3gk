import { db } from "./db";
import type { Crew } from "../models/Crew";

export const crewRepository = {
  findAll(): Crew[] {
    return db.crew;
  },
  findById(id: number): Crew | undefined {
    return db.crew.find((row) => row.id === id);
  },
  update(id: number, patch: Partial<Crew>): Crew {
    const row = this.findById(id);
    if (!row) throw new Error(`crew ${id} not found`);
    Object.assign(row, patch);
    return row;
  }
};
