<script setup lang="ts">
import { ref } from "vue";
import { useCrewStore } from "../../stores/CrewStore";
import StatusBadge from "../../components/common/StatusBadge.vue";
import PriorityTag from "../../components/common/PriorityTag.vue";
import { ApiError } from "../../api/http";
import { formatFaultType, formatPriority } from "../../utils/formatters";

// 当班班组栏：展示值班状态、技能与当前占用；空闲班组可触发“更紧急任务占用”以演示派工冲突退回。
const crewStore = useCrewStore();

const emit = defineEmits<{
  (e: "occupied"): void;
  (e: "message", payload: { type: "success" | "error" | "info"; text: string }): void;
}>();

const occupying = ref<number | null>(null);

const occupy = async (crewId: number) => {
  occupying.value = crewId;
  try {
    const result = await crewStore.urgentOccupy(crewId, {
      fault_type: "OUTAGE",
      address_desc: "调度紧急来电：倒杆断线需立即处置（紧急）"
    });
    emit("message", { type: "info", text: `${result.crew.name} 已被更紧急工单#${result.ticket.id}（${formatPriority(result.ticket.priority)}）占用` });
    emit("occupied");
  } catch (error) {
    emit("message", { type: "error", text: error instanceof ApiError ? error.message : "占用操作失败" });
  } finally {
    occupying.value = null;
  }
};
</script>

<template>
  <div class="panel">
    <h2>当班班组</h2>
    <ul class="crew-list">
      <li v-for="crew in crewStore.rows" :key="crew.id" :class="{ off: crew.duty_status !== 'ON_DUTY' }">
        <div class="crew-row">
          <strong>{{ crew.name }}</strong>
          <StatusBadge :value="crew.duty_status" kind="duty" />
        </div>
        <p class="muted">{{ crew.contact_phone }} · 技能：{{ crew.skill_tags.split(",").map(formatFaultType).join("、") }}</p>
        <p v-if="crew.current_ticket_id > 0" class="occupy-note">
          占用：工单#{{ crew.current_ticket_id }}
          <PriorityTag :value="crew.occupied_ticket_priority ?? ''" v-if="crew.occupied_ticket_priority" />
          <span v-if="crew.occupied_reason"> {{ crew.occupied_reason }}</span>
        </p>
        <button
          v-else-if="crew.duty_status === 'ON_DUTY'"
          class="btn warn small"
          :disabled="occupying === crew.id"
          @click="occupy(crew.id)"
        >
          {{ occupying === crew.id ? "占用中…" : "模拟被更紧急任务占用" }}
        </button>
      </li>
    </ul>
  </div>
</template>
