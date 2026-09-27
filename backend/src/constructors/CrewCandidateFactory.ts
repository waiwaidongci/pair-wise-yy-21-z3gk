import type { Crew } from "../models/Crew";
import type { RepairTicket } from "../models/RepairTicket";

export interface CrewCandidateView {
  crew: Crew;
  eligible: boolean;
  busy: boolean;
  occupied_by_ticket: RepairTicket | null;
  reject_reason: string | null;
}

export const createCrewCandidateView = (
  crew: Crew,
  eligible: boolean,
  occupiedByTicket: RepairTicket | null,
  rejectReason: string | null
): CrewCandidateView => ({
  crew: { ...crew, skill_tags: [...crew.skill_tags] },
  eligible,
  busy: occupiedByTicket !== null,
  occupied_by_ticket: occupiedByTicket,
  reject_reason: rejectReason
});
