import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { CrewCandidate } from "../types/dispatch";
import { requiredSkillOf } from "../constants/SkillTag";

// 派工班组可用性：必须当班 + 技能匹配；被占用班组单独标出
export function useCrewAvailability(source: MaybeRefOrGetter<CrewCandidate[]>, faultType: MaybeRefOrGetter<string> = "OUTAGE") {
  const candidates = computed(() => toValue(source));
  const requiredSkill = computed(() => requiredSkillOf(toValue(faultType)));

  const eligibleCrews = computed(() => candidates.value.filter((candidate) => candidate.eligible));
  const occupiedCrews = computed(() =>
    candidates.value.filter((candidate) => candidate.crew.duty_status === "ON_DUTY" && candidate.busy)
  );
  const unqualifiedCrews = computed(() =>
    candidates.value.filter((candidate) => candidate.crew.duty_status !== "ON_DUTY" || !candidate.crew.skill_tags.includes(requiredSkill.value))
  );

  return { candidates, requiredSkill, eligibleCrews, occupiedCrews, unqualifiedCrews };
}
