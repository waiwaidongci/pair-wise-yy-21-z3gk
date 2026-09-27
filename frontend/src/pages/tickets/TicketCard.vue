<script setup lang="ts">
import { computed } from "vue";
import type { RepairTicketView } from "../../types/dispatch";
import StatusBadge from "../../components/common/StatusBadge.vue";
import PriorityTag from "../../components/common/PriorityTag.vue";
import TimelineList from "../../components/common/TimelineList.vue";
import { formatAgo, formatFaultType, formatTime } from "../../utils/formatters";
import { canArrive, canClose, canDispatch, canRestore } from "../../hooks/useTicketFlow";

const props = defineProps<{ ticket: RepairTicketView }>();
const emit = defineEmits<{
  (e: "dispatch", ticket: RepairTicketView): void;
  (e: "arrive", ticket: RepairTicketView): void;
  (e: "restore", ticket: RepairTicketView): void;
  (e: "close", ticket: RepairTicketView): void;
}>();

const showTimeline = computed(() => props.ticket.events.length > 0);
const phonesText = computed(() => props.ticket.phones.join("、"));
</script>

<template>
  <article class="ticket-card" :class="{ conflicted: ticket.conflict_ticket_id != null && ticket.status === 'WAIT_DISPATCH' }">
    <header class="ticket-head">
      <div class="ticket-title">
        <strong>#{{ ticket.id }}</strong>
        <span class="line">{{ ticket.feeder_line }}</span>
        <PriorityTag :value="ticket.priority" />
      </div>
      <StatusBadge :value="ticket.status" />
    </header>

    <p class="ticket-desc">{{ formatFaultType(ticket.fault_type) }} · {{ ticket.address_desc }}</p>

    <div class="ticket-phones" :title="phonesText">
      <span class="phone-icon">☎</span>
      <span class="phone-list">{{ phonesText }}</span>
      <em v-if="ticket.merged_reports.length">已合并 {{ ticket.merged_reports.length }} 起</em>
    </div>

    <ul class="report-chips">
      <li class="chip primary">
        主报修 #{{ ticket.primary_report.id }} · {{ ticket.primary_report.reporter_name }}（{{ ticket.primary_report.phone }}）
        <StatusBadge :value="ticket.primary_report.status" soft />
      </li>
      <li v-for="report in ticket.merged_reports" :key="report.id" class="chip merged">
        并入 #{{ report.id }} · {{ report.reporter_name }}（{{ report.phone }}）
        <StatusBadge :value="report.status" soft />
      </li>
    </ul>

    <div v-if="ticket.conflict_ticket_id != null && ticket.status === 'WAIT_DISPATCH'" class="conflict-banner">
      <strong>派工冲突 · 已退回待派</strong>
      <p>{{ ticket.conflict_reason }}</p>
      <p class="conflict-meta">冲突工单 #{{ ticket.conflict_ticket_id }} · 占用班组 #{{ ticket.conflict_team_id }}</p>
    </div>

    <div class="ticket-meta">
      <span>建单 {{ formatAgo(ticket.created_at) }}</span>
      <span v-if="ticket.assigned_at">派工 {{ formatTime(ticket.assigned_at) }}</span>
      <span v-if="ticket.arrived_at">到场 {{ formatTime(ticket.arrived_at) }}</span>
      <span v-if="ticket.restored_at">复电 {{ formatTime(ticket.restored_at) }}</span>
    </div>

    <div v-if="ticket.restore_result" class="restore-result">
      <strong>复电结果</strong>
      <p>{{ ticket.restore_result }}</p>
    </div>

    <div v-if="ticket.team" class="ticket-team">承接班组：{{ ticket.team.name }}（{{ ticket.team.contact_phone }}）</div>

    <div class="ticket-actions">
      <button v-if="canDispatch(ticket)" class="primary-btn small" @click="emit('dispatch', ticket)">派工</button>
      <button v-if="canArrive(ticket)" class="primary-btn small" @click="emit('arrive', ticket)">到场 · 进入处理中</button>
      <button v-if="canRestore(ticket)" class="primary-btn small" @click="emit('restore', ticket)">复电登记</button>
      <button v-if="canClose(ticket)" class="ghost-btn small" @click="emit('close', ticket)">归档</button>
    </div>

    <details v-if="showTimeline" class="ticket-timeline">
      <summary>流转记录（{{ ticket.events.length }}）</summary>
      <TimelineList :events="ticket.events" />
    </details>
  </article>
</template>
