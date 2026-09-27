import { computed, type Ref } from "vue";
import type { DispatchCandidate } from "../types/DispatchCandidate";
import type { Crew } from "../types/Crew";
import { priorityRank } from "../constants/crewMatch";

// 班组可用性：当班 + 技能匹配 + 空闲才可派工；
// 被占用时进一步判断占用任务是否更紧急，为冲突退回提示提供依据。
export function useCrewAvailability(
  rows: Ref<DispatchCandidate[]> | DispatchCandidate[],
  ticketPriority: Ref<string> | string
) {
  const getRows = () => ("value" in rows ? rows.value : rows);
  const getPriority = () => (typeof ticketPriority === "string" ? ticketPriority : ticketPriority.value);

  const eligible = computed(() => getRows().filter((row) => row.eligible));
  const blocked = computed(() =>
    getRows().filter((row) => row.on_duty && row.skill_match && row.occupied)
  );

  // 更紧急任务占用：会导致派工 DISPATCH_CONFLICT 退回待派。
  const conflictCrews = computed(() =>
    blocked.value.filter((row) => (row.occupied_priority ? priorityRank(row.occupied_priority) > priorityRank(getPriority()) : false))
  );

  const unavailableReason = (row: DispatchCandidate): string => {
    if (!row.on_duty) return "非当班";
    if (!row.skill_match) return "技能不匹配";
    if (row.occupied) return `处理工单#${row.occupied_ticket_id}中`;
    return "";
  };

  return { eligible, blocked, conflictCrews, unavailableReason };
}

// 班组列表（非候选视角）的当班筛选。
export function useDutyCrews(crews: Ref<Crew[]>) {
  return computed(() => crews.value.filter((crew) => crew.duty_status === "ON_DUTY"));
}
