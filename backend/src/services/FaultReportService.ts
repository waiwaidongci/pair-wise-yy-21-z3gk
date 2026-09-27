import { faultReportRepository } from "../repositories/FaultReportRepository";
import { createFaultReportDto } from "../constructors/FaultReportDtoFactory";
import type { FaultReport } from "../models/FaultReport";
import type { FaultReportPayload } from "../types/FaultReportPayload";

export const faultReportService = {
  list: (): FaultReport[] => faultReportRepository.findAll(),
  create: (payload: Partial<FaultReportPayload>): FaultReport =>
    faultReportRepository.insert(
      createFaultReportDto({ ...payload, id: faultReportRepository.nextId(), reported_at: payload.reported_at ?? new Date().toISOString() }) as FaultReport
    )
};
