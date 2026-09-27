import { FaultTypeText } from "./FaultType";
import { TicketStatusText } from "./TicketStatus";
import { AssetHealthStatusText } from "./AssetHealthStatus";
import { PriorityText, SeverityText } from "./Priority";
import { SkillTagText } from "./SkillTag";
import { CrewDutyStatusText } from "./CrewDutyStatus";
import { ReportStatusText, ReportChannelText } from "./ReportStatus";

export const STATUS_TEXT = {
  FaultType: FaultTypeText,
  TicketStatus: TicketStatusText,
  AssetHealthStatus: AssetHealthStatusText,
  Priority: PriorityText,
  Severity: SeverityText,
  SkillTag: SkillTagText,
  CrewDutyStatus: CrewDutyStatusText,
  ReportStatus: ReportStatusText,
  ReportChannel: ReportChannelText
} as const;
