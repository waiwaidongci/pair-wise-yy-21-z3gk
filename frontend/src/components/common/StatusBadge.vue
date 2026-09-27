<script setup lang="ts">
import { computed } from "vue";
import { TicketStatusText } from "../../constants/TicketStatus";
import { ReportStatusText } from "../../constants/ReportStatus";
import { CrewDutyStatusText } from "../../constants/CrewDutyStatus";

// 跨页面共享徽章：工单状态 / 报修状态 / 值班状态统一配色，未识别值回退原值展示。
const props = defineProps<{ value: string; kind?: "ticket" | "report" | "duty" | "raw" }>();

const text = computed(() => {
  const maps: Record<string, Record<string, string>> = {
    ticket: TicketStatusText,
    report: ReportStatusText,
    duty: CrewDutyStatusText
  };
  const map = maps[props.kind ?? "ticket"];
  return map?.[props.value] ?? props.value.replace(/_/g, " ");
});
</script>

<template>
  <span class="badge" :class="kind ?? 'ticket'" :data-value="value">{{ text }}</span>
</template>
