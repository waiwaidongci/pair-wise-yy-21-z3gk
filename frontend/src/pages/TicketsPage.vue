<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useCrewStore } from "../stores/CrewStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import StatCard from "../components/common/StatCard.vue";
import TicketCard from "./tickets/TicketCard.vue";
import RegisterReportPanel from "./tickets/RegisterReportPanel.vue";
import CrewDutyPanel from "./tickets/CrewDutyPanel.vue";

// 抢修工单 · 合并派工台：
// 后来的报修并入最早待处理单、来电号码集中保留；派工仅可选当班且技能匹配班组；
// 到场后合并报修一起进入处理中；复电统一登记时间和结果；
// 班组被更紧急任务占用时派工退回待派，并标出冲突工单与占用原因。
const ticketStore = useRepairTicketStore();
const faultStore = useFaultReportStore();
const crewStore = useCrewStore();
const assetStore = useGridAssetStore();

type FilterKey = "ALL" | "WAIT_DISPATCH" | "IN_PROGRESS" | "RESTORED";
const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "全部" },
  { key: "WAIT_DISPATCH", label: "待派工" },
  { key: "IN_PROGRESS", label: "进行中" },
  { key: "RESTORED", label: "已复电/归档" }
];
const activeFilter = ref<FilterKey>("ALL");

const toast = ref<{ type: "success" | "error" | "info"; text: string } | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const notify = (payload: { type: "success" | "error" | "info"; text: string }) => {
  toast.value = payload;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 4200);
};

const reloadAll = async () => {
  await Promise.all([ticketStore.load(), faultStore.load(), crewStore.load()]);
};

onMounted(async () => {
  await Promise.all([ticketStore.load(), faultStore.load(), crewStore.load(), assetStore.load()]);
});

const reportsOf = (ticketId: number) => faultStore.byTicket(ticketId);

const filteredTickets = computed(() => {
  switch (activeFilter.value) {
    case "WAIT_DISPATCH":
      return ticketStore.rows.filter((row) => row.status === "WAIT_DISPATCH");
    case "IN_PROGRESS":
      return ticketStore.rows.filter((row) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status));
    case "RESTORED":
      return ticketStore.rows.filter((row) => ["RESTORED", "CLOSED"].includes(row.status));
    default:
      return ticketStore.rows;
  }
});

const ticketSort = (a: { id: number }, b: { id: number }) => a.id - b.id;
const visibleTickets = computed(() => [...filteredTickets.value].sort(ticketSort));

const conflictCount = computed(() => ticketStore.rows.filter((row) => row.conflict_reason && row.status === "WAIT_DISPATCH").length);
</script>

<template>
  <section class="console">
    <div class="console-head">
      <div>
        <p class="eyebrow">grid-repair · 合并派工台</p>
        <h2>抢修工单</h2>
        <p class="muted">重复报修自动并入最早待处理单，派工按当班与技能匹配选班，冲突退回待派并标注占用工单。</p>
      </div>
      <button class="btn" @click="reloadAll">刷新数据</button>
    </div>

    <section class="metrics">
      <StatCard label="待派工单" :value="ticketStore.waitDispatch.length" />
      <StatCard label="进行中工单" :value="ticketStore.inProgress.length" />
      <StatCard label="今日已复电" :value="ticketStore.rows.filter((row) => row.status === 'RESTORED' || row.status === 'CLOSED').length" />
      <StatCard label="当班班组" :value="crewStore.onDuty.length" />
    </section>

    <div v-if="conflictCount > 0" class="conflict-banner">有 {{ conflictCount }} 张工单派工时被更紧急任务占用，已退回待派，请重新选班。</div>

    <div class="console-grid">
      <div class="ticket-column">
        <nav class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.key"
            :class="{ active: activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </nav>

        <div v-if="ticketStore.loading" class="muted loading-note">加载工单中…</div>
        <div v-else-if="visibleTickets.length === 0" class="empty">当前筛选下暂无工单</div>
        <TicketCard
          v-for="ticket in visibleTickets"
          :key="ticket.id"
          :ticket="ticket"
          :reports="reportsOf(ticket.id)"
          @message="notify"
          @changed="reloadAll"
        />
      </div>

      <aside class="side-column">
        <RegisterReportPanel @registered="reloadAll" @message="notify" />
        <CrewDutyPanel @occupied="reloadAll" @message="notify" />
      </aside>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">{{ toast.text }}</div>
    </transition>
  </section>
</template>
