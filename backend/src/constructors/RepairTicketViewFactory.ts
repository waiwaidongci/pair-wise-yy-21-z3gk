import type { RepairTicket, TicketEvent } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import { dedupePhones } from "../utils/formatters";

export interface FaultReportView extends FaultReport {
  is_primary: boolean;
}

export interface RepairTicketView extends RepairTicket {
  primary_report: FaultReportView;
  merged_reports: FaultReportView[];
  // 来电号码集中保留：主单 + 全部合并报修号码去重汇总
  phones: string[];
  report_count: number;
  team: Crew | null;
}

const toReportView = (report: FaultReport, ticket: RepairTicket): FaultReportView => ({
  ...report,
  is_primary: report.id === ticket.fault_report_id
});

export const createRepairTicketView = (
  ticket: RepairTicket,
  reports: FaultReport[],
  crew: Crew | null
): RepairTicketView => {
  const memberIds = [ticket.fault_report_id, ...ticket.merged_report_ids];
  const members = reports.filter((report) => memberIds.includes(report.id));
  const primary = members.find((report) => report.id === ticket.fault_report_id) ?? members[0];
  const merged = members.filter((report) => report.id !== ticket.fault_report_id);

  return {
    ...ticket,
    events: [...ticket.events].sort((a: TicketEvent, b: TicketEvent) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    primary_report: primary ? toReportView(primary, ticket) : toReportView({} as FaultReport, ticket),
    merged_reports: merged.map((report) => toReportView(report, ticket)),
    phones: dedupePhones(members.map((report) => report.phone)),
    report_count: members.length,
    team: crew ? { ...crew, skill_tags: [...crew.skill_tags] } : null
  };
};
