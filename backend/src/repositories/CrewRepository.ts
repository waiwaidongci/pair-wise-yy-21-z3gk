import { db } from "../models/db";
import type { Crew } from "../models/Crew";

export const crewRepository = {
  findAll: (): Crew[] => db.crew,
  findById: (id: number): Crew | undefined => db.crew.find((row) => row.id === id),
  save: (row: Crew): Crew => {
    db.crew.push(row);
    return row;
  },
  update: (id: number, patch: Partial<Crew>): Crew | undefined => {
    const row = db.crew.find((item) => item.id === id);
    if (row) Object.assign(row, patch);
    return row;
  }
};
