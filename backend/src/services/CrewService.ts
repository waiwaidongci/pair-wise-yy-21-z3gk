import { crewRepository } from "../repositories/CrewRepository";
import type { Crew } from "../models/Crew";
import type { CrewPayload } from "../types/CrewPayload";
import { DomainError } from "../utils/errors";

export const crewService = {
  list: (): Crew[] => crewRepository.findAll(),
  update: (id: number, payload: CrewPayload): Crew => {
    const crew = crewRepository.findById(id);
    if (!crew) throw new DomainError("CREW_NOT_FOUND", 404, `班组 #${id} 不存在`);
    return crewRepository.update(id, payload);
  }
};
