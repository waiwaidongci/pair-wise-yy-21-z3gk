<script setup lang="ts">
import type { TicketEvent } from "../../types/RepairTicket";
import { formatTime } from "../../utils/formatters";

defineProps<{ events: TicketEvent[] }>();

const dotClass: Record<TicketEvent["type"], string> = {
  CREATE: "dot-create",
  MERGE: "dot-merge",
  DISPATCH: "dot-dispatch",
  DISPATCH_CONFLICT: "dot-conflict",
  ARRIVE: "dot-arrive",
  REPAIRING: "dot-repairing",
  RESTORE: "dot-restore",
  CLOSE: "dot-close"
};
</script>

<template>
  <ol class="timeline">
    <li v-for="(event, index) in events" :key="`${event.type}-${index}`" :class="{ conflict: event.type === 'DISPATCH_CONFLICT' }">
      <span class="dot" :class="dotClass[event.type]"></span>
      <div class="timeline-body">
        <p>{{ event.note }}</p>
        <time>{{ formatTime(event.at) }}</time>
      </div>
    </li>
    <li v-if="events.length === 0" class="empty-line">暂无流转记录</li>
  </ol>
</template>
