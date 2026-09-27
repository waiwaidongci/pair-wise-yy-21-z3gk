<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { useTicketFlow } from "../hooks/useTicketFlow";
import CallRegisterPanel from "./tickets/CallRegisterPanel.vue";
import TicketCard from "./tickets/TicketCard.vue";
import DispatchDialog from "./tickets/DispatchDialog.vue";
import RestoreDialog from "./tickets/RestoreDialog.vue";
import StatCard from "../components/common/StatCard.vue";
import type { RepairTicketView } from "../types/dispatch";

const store = useRepairTicketStore();
const assetStore = useGridAssetStore();
const { rows, loading, lastToast } = storeToRefs(store);

const { columns, waitingTickets, conflictTickets } = useTicketFlow(rows);

const dispatchTarget = ref<RepairTicketView | null>(null);
const restoreTarget = ref<RepairTicketView | null>(null);

const mergedReportTotal = computed(() => rows.value.reduce((sum, ticket) => sum + ticket.merged_reports.length, 0));
const restoredToday = computed(() => rows.value.filter((ticket) => ticket.status === "RESTORED").length);

onMounted(async () => {
  await Promise.all([store.load(), assetStore.load()]);
});

const onArrive = async (ticket: RepairTicketView) => {
  await store.arrive(ticket.id);
};

const onClose = async (ticket: RepairTicketView) => {
  await store.close(ticket.id);
};

const dismissToast = () => store.clearToast();
</script>

<template>
  <section class="dispatch-console">
    <div class="console-head">
      <div>
        <p class="eyebrow">merge dispatch workbench</p>
        <h2>抢修工单 · 合并派工台</h2>
        <p class="subtitle">同线路同故障重复来电自动并入最早待处理单，号码集中保留；派工限当班且技能匹配班组。</p>
      </div>
      <button class="ghost-btn" :disabled="loading" @click="store.load()">刷新态势</button>
    </div>

    <div v-if="lastToast" class="toast" :class="lastToast.type" @click="dismissToast">
      {{ lastToast.message }}
      <span v-if="lastToast.type === 'error' && lastToast.conflictTicketId" class="toast-extra">
        （冲突工单 #{{ lastToast.conflictTicketId }}）
      </span>
    </div>

    <section class="metrics metrics-4">
      <StatCard label="待派工单" :value="waitingTickets.length" />
      <StatCard label="处理中工单" :value="rows.filter(t => ['ASSIGNED','ARRIVED','REPAIRING'].includes(t.status)).length" />
      <StatCard label="已合并来电" :value="mergedReportTotal" />
      <StatCard label="已复电待归档" :value="restoredToday" />
    </section>

    <div v-if="conflictTickets.length" class="conflict-summary">
      <strong>派工冲突提醒</strong>
      <ul>
        <li v-for="ticket in conflictTickets" :key="ticket.id">
          工单 #{{ ticket.id }}：{{ ticket.conflict_reason }}（冲突工单 #{{ ticket.conflict_ticket_id }}），已退回待派，请改派班组
        </li>
      </ul>
    </div>

    <div class="console-layout">
      <div class="kanban">
        <div v-for="column in columns" :key="column.status" class="kanban-col">
          <header class="kanban-head">
            <span>{{ column.label }}</span>
            <i>{{ column.rows.length }}</i>
          </header>
          <div v-if="column.rows.length" class="kanban-body">
            <TicketCard
              v-for="ticket in column.rows"
              :key="ticket.id"
              :ticket="ticket"
              @dispatch="dispatchTarget = $event"
              @arrive="onArrive"
              @restore="restoreTarget = $event"
              @close="onClose"
            />
          </div>
          <p v-else class="kanban-empty">暂无工单</p>
        </div>
      </div>

      <aside class="side-panel">
        <CallRegisterPanel />
      </aside>
    </div>

    <DispatchDialog v-if="dispatchTarget" :ticket="dispatchTarget" @close="dispatchTarget = null" />
    <RestoreDialog v-if="restoreTarget" :ticket="restoreTarget" @close="restoreTarget = null" />
  </section>
</template>
