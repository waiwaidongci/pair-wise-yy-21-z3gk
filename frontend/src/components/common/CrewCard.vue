<script setup lang="ts">
import { computed } from "vue";
import type { DispatchCandidate } from "../../types/DispatchCandidate";
import StatusBadge from "./StatusBadge.vue";
import { formatPriority } from "../../utils/formatters";

// 派工台共享班组卡片：派工候选与当班班组列表共用。
// mode="candidate" 时展示当班/技能/占用判定与派工按钮。
const props = defineProps<{
  crew: DispatchCandidate;
  mode?: "candidate";
  reason?: string;
}>();

const emit = defineEmits<{ (e: "dispatch", crewId: number): void }>();

const skillList = computed(() => props.crew.skills.split(",").map((item) => item.trim()).filter(Boolean));
const dutyBadge = computed(() => (props.crew.on_duty ? "ON_DUTY" : "OFF_DUTY"));
</script>

<template>
  <article class="crew-card" :class="{ disabled: !crew.eligible, occupied: crew.occupied && crew.on_duty && crew.skill_match }">
    <header>
      <strong>{{ crew.name }}</strong>
      <StatusBadge :value="dutyBadge" kind="duty" />
    </header>
    <p class="muted">联系电话 {{ crew.contact_phone }}</p>
    <div class="skill-row">
      <span v-for="skill in skillList" :key="skill" class="skill-chip" :class="{ miss: mode === 'candidate' && !crew.skill_match }">
        {{ skill }}
      </span>
    </div>
    <p v-if="crew.occupied" class="occupy-note">
      正在处理工单#{{ crew.occupied_ticket_id }}<template v-if="crew.occupied_priority">（{{ formatPriority(crew.occupied_priority) }}）</template>
      <template v-if="crew.occupied_reason">：{{ crew.occupied_reason }}</template>
    </p>
    <footer>
      <span v-if="reason" class="block-reason">{{ reason }}</span>
      <button v-if="mode === 'candidate'" class="btn primary" :disabled="!crew.eligible" @click="emit('dispatch', crew.crew_id)">
        派给该班组
      </button>
    </footer>
  </article>
</template>
