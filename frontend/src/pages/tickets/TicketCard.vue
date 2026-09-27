<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import type { RepairTicket } from "../../types/RepairTicket";
import type { FaultReport } from "../../types/FaultReport";
import { useRepairTicketStore } from "../../stores/RepairTicketStore";
import { useTicketFlow } from "../../hooks/useTicketFlow";
import { useCrewAvailability } from "../../hooks/useCrewAvailability";
import StatusBadge from "../../components/common/StatusBadge.vue";
import PriorityTag from "../../components/common/PriorityTag.vue";
import CrewCard from "../../components/common/CrewCard.vue";
import TimelineList from "../../components/common/TimelineList.vue";
import { ApiError } from "../../api/http";
import { formatFaultType, formatDate } from "../../utils/formatters";

const props = defineProps<{ ticket: RepairTicket; reports: FaultReport[] }>();
const emit = defineEmits<{
  (e: "message", payload: { type: "success" | "error" | "info"; text: string }): void;
  (e: "changed"): void;
}>();

const ticketStore = useRepairTicketStore();
const { candidates } = storeToRefs(ticketStore);

const ticketRef = computed(() => props.ticket);
const { nextAction, steps } = useTicketFlow(ticketRef);

const dispatchOpen = ref(false);
const dispatching = ref(false);
const restoreOpen = ref(false);
const restoreResult = ref("");
const restoreTime = ref("");
const busy = ref(false);

const candidateRows = computed(() => candidates.value[props.ticket.id] ?? []);
const { unavailableReason } = useCrewAvailability(candidateRows, computed(() => props.ticket.priority));

const mergedReports = computed(() => props.reports);

const openDispatch = async () => {
  dispatchOpen.value = !dispatchOpen.value;
  if (dispatchOpen.value && candidateRows.value.length === 0) {
    await ticketStore.loadCandidates(props.ticket.id);
  }
};

const notify = (type: "success" | "error" | "info", text: string) => emit("message", { type, text });

const doDispatch = async (crewId: number) => {
  dispatching.value = true;
  try {
    await ticketStore.dispatch(props.ticket.id, crewId);
    dispatchOpen.value = false;
    notify("success", `工单#${props.ticket.id} 已派工，班组出动`);
    emit("changed");
  } catch (error) {
    // 班组刚被更紧急任务占用：派工退回待派，冲突工单和占用原因由后端 details 返回。
    await ticketStore.load();
    if (error instanceof ApiError && error.code === "DISPATCH_CONFLICT") {
      const details = error.details as { conflict_ticket_id?: number; occupied_reason?: string; crew_name?: string };
      notify("error", `派工退回待派：${details.crew_name} 已被更紧急工单#${details.conflict_ticket_id} 占用（${details.occupied_reason}），冲突已标注在工单#${props.ticket.id}`);
    } else if (error instanceof ApiError) {
      notify("error", error.message);
    } else {
      notify("error", "派工请求失败，请稍后再试");
    }
  } finally {
    dispatching.value = false;
  }
};

const doArrive = async () => {
  busy.value = true;
  try {
    await ticketStore.arrive(props.ticket.id);
    notify("success", `工单#${props.ticket.id} 班组已到场，合并报修一起进入处理中`);
    emit("changed");
  } catch (error) {
    notify("error", error instanceof ApiError ? error.message : "到场确认失败");
  } finally {
    busy.value = false;
  }
};

const doStartRepair = async () => {
  busy.value = true;
  try {
    await ticketStore.startRepair(props.ticket.id);
    notify("success", `工单#${props.ticket.id} 进入处理中`);
    emit("changed");
  } catch (error) {
    notify("error", error instanceof ApiError ? error.message : "状态更新失败");
  } finally {
    busy.value = false;
  }
};

const openRestore = () => {
  restoreResult.value = "";
  restoreTime.value = "";
  restoreOpen.value = true;
};

const doRestore = async () => {
  if (!restoreResult.value.trim()) {
    notify("error", "请填写复电结果");
    return;
  }
  busy.value = true;
  try {
    await ticketStore.restore(props.ticket.id, {
      restore_result: restoreResult.value.trim(),
      ...(restoreTime.value ? { restored_at: new Date(restoreTime.value).toISOString() } : {})
    });
    restoreOpen.value = false;
    notify("success", `工单#${props.ticket.id} 已统一登记复电时间与结果，班组释放`);
    emit("changed");
  } catch (error) {
    notify("error", error instanceof ApiError ? error.message : "复电登记失败");
  } finally {
    busy.value = false;
  }
};

const doClose = async () => {
  busy.value = true;
  try {
    await ticketStore.close(props.ticket.id);
    notify("success", `工单#${props.ticket.id} 已归档`);
    emit("changed");
  } catch (error) {
    notify("error", error instanceof ApiError ? error.message : "归档失败");
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <article class="ticket-card" :data-status="ticket.status">
    <header class="ticket-head">
      <div class="ticket-title">
        <span class="ticket-id">#{{ ticket.id }}</span>
        <PriorityTag :value="ticket.priority" />
        <StatusBadge :value="ticket.status" kind="ticket" />
        <span class="fault-type">{{ formatFaultType(ticket.fault_type) }}</span>
      </div>
      <span class="feeder">{{ ticket.feeder_line }}</span>
    </header>

    <p class="address">{{ ticket.address_desc }}</p>

    <div class="caller-box">
      <span class="label">来电号码（{{ ticket.caller_phones.length }}）</span>
      <span v-for="phone in ticket.caller_phones" :key="phone" class="caller-chip">{{ phone }}</span>
    </div>

    <details class="merged-box" :open="ticket.merged_report_ids.length > 1">
      <summary>合并报修 {{ ticket.merged_report_ids.length }} 笔</summary>
      <ul>
        <li v-for="report in mergedReports" :key="report.id">
          <span>#{{ report.id }} {{ report.reporter_name }} {{ report.phone }}</span>
          <StatusBadge :value="report.status" kind="report" />
          <span class="muted">{{ formatDate(report.reported_at) }}</span>
        </li>
      </ul>
    </details>

    <!-- 派工冲突：被更紧急任务占用而退回待派时，标出冲突工单和占用原因 -->
    <div v-if="ticket.conflict_reason" class="conflict-alert">
      <strong>⚠ 派工退回待派</strong>
      <span>冲突工单：#{{ ticket.conflict_ticket_id }}｜占用原因：{{ ticket.conflict_reason }}</span>
    </div>

    <TimelineList :steps="steps" compact />

    <p v-if="ticket.restore_result" class="restore-note">复电结果：{{ ticket.restore_result }}（{{ formatDate(ticket.restored_at) }}）</p>

    <footer class="ticket-actions">
      <template v-if="nextAction?.key === 'dispatch'">
        <button class="btn primary" :disabled="dispatching" @click="openDispatch">{{ dispatchOpen ? "收起班组列表" : nextAction.label }}</button>
      </template>
      <button v-if="nextAction?.key === 'arrive'" class="btn primary" :disabled="busy" @click="doArrive">{{ nextAction.label }}</button>
      <button v-if="nextAction?.key === 'startRepair'" class="btn" :disabled="busy" @click="doStartRepair">{{ nextAction.label }}</button>
      <template v-if="nextAction?.key === 'restore'">
        <button class="btn primary" @click="openRestore">复电登记</button>
      </template>
      <button v-if="nextAction?.key === 'close'" class="btn" :disabled="busy" @click="doClose">归档</button>
    </footer>

    <div v-if="dispatchOpen" class="dispatch-panel">
      <h4>选择当班且技能匹配的班组</h4>
      <div class="crew-grid">
        <CrewCard
          v-for="crew in candidateRows"
          :key="crew.crew_id"
          :crew="crew"
          mode="candidate"
          :reason="crew.eligible ? '' : unavailableReason(crew)"
          @dispatch="doDispatch"
        />
      </div>
    </div>

    <div v-if="restoreOpen" class="restore-panel">
      <h4>统一复电登记</h4>
      <label>
        复电时间（留空取当前时间）
        <input v-model="restoreTime" type="datetime-local" />
      </label>
      <label>
        复电结果
        <textarea v-model="restoreResult" rows="2" placeholder="如：更换跌落式熔断器，台区复电正常"></textarea>
      </label>
      <div class="inline-actions">
        <button class="btn primary" :disabled="busy" @click="doRestore">确认复电</button>
        <button class="btn" @click="restoreOpen = false">取消</button>
      </div>
    </div>
  </article>
</template>
