<script setup lang="ts">
import type { TicketFlowStep } from "../../hooks/useTicketFlow";
import { formatDate } from "../../utils/formatters";

// 跨页面共享时间轴：展示工单“待派工→派工→到场→处理→复电→归档”节点。
defineProps<{ steps: TicketFlowStep[]; compact?: boolean }>();
</script>

<template>
  <ol class="timeline" :class="{ compact }">
    <li v-for="step in steps" :key="step.key" :class="{ done: step.done, current: step.current }">
      <span class="dot" />
      <div>
        <strong>{{ step.label }}</strong>
        <span v-if="step.at" class="muted">{{ formatDate(step.at) }}</span>
      </div>
    </li>
  </ol>
</template>
