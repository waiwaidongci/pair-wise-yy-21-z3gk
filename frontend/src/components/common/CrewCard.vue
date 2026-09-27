<script setup lang="ts">
import { computed } from "vue";
import type { CrewCandidate } from "../../types/dispatch";
import { formatDutyStatus, formatSkillTag } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{
  candidate: CrewCandidate;
  requiredSkill: string;
  selected?: boolean;
  selectable?: boolean;
}>();

defineEmits<{ (e: "select", id: number): void }>();

const skillMatched = computed(() => props.candidate.crew.skill_tags.includes(props.requiredSkill));
</script>

<template>
  <button
    type="button"
    class="crew-card"
    :class="{
      selected,
      disabled: !candidate.eligible,
      busy: candidate.busy,
      offline: candidate.crew.duty_status !== 'ON_DUTY'
    }"
    :disabled="selectable === true ? false : !candidate.eligible"
    @click="$emit('select', candidate.crew.id)"
  >
    <div class="crew-head">
      <strong>{{ candidate.crew.name }}</strong>
      <StatusBadge :value="candidate.crew.duty_status" soft />
    </div>
    <div class="crew-skills">
      <span v-for="tag in candidate.crew.skill_tags" :key="tag" class="skill-chip" :class="{ hit: tag === requiredSkill }">
        {{ formatSkillTag(tag) }}
      </span>
      <em v-if="!skillMatched" class="miss">缺少必备技能</em>
    </div>
    <div class="crew-foot">
      <span>联系电话 {{ candidate.crew.contact_phone }}</span>
      <span v-if="candidate.busy && candidate.occupied_by_ticket" class="busy-text">
        被 #{{ candidate.occupied_by_ticket.id }}（{{ candidate.occupied_by_ticket.priority }}）占用
      </span>
      <span v-else-if="candidate.crew.duty_status !== 'ON_DUTY'" class="busy-text">{{ formatDutyStatus(candidate.crew.duty_status) }}，不可派</span>
      <span v-else class="free-text">空闲可派</span>
    </div>
  </button>
</template>
