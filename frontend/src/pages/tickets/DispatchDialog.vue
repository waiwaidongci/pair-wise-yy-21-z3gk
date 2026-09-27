<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../../stores/RepairTicketStore";
import ModalDialog from "../../components/common/ModalDialog.vue";
import CrewCard from "../../components/common/CrewCard.vue";
import { useCrewAvailability } from "../../hooks/useCrewAvailability";
import { formatFaultType, formatSkillTag } from "../../utils/formatters";
import type { RepairTicketView } from "../../types/dispatch";

const props = defineProps<{ ticket: RepairTicketView }>();
const emit = defineEmits<{ (e: "close"): void }>();

const store = useRepairTicketStore();
const { candidates } = storeToRefs(store);
const { requiredSkill, eligibleCrews, occupiedCrews, unqualifiedCrews } = useCrewAvailability(candidates, () => props.ticket.fault_type);

const selectedCrewId = ref<number | null>(null);
const submitting = ref(false);
const errorMessage = ref("");

const canSubmit = computed(() => selectedCrewId.value != null && !submitting.value);

onMounted(async () => {
  await store.loadCandidates(props.ticket.id);
  selectedCrewId.value = eligibleCrews.value[0]?.crew.id ?? null;
});

const submit = async () => {
  if (selectedCrewId.value == null) return;
  submitting.value = true;
  errorMessage.value = "";
  try {
    await store.dispatch(props.ticket.id, selectedCrewId.value);
    emit("close");
  } catch (err) {
    errorMessage.value = (err as Error).message ?? "派工失败";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <ModalDialog :title="`派工 · 工单 #${ticket.id}`" width="640px" @close="emit('close')">
    <div class="dispatch-summary">
      <p>
        {{ ticket.feeder_line }} · {{ formatFaultType(ticket.fault_type) }} · 合并报修 {{ ticket.report_count }} 起
      </p>
      <p class="required-skill">必备技能：<b>{{ formatSkillTag(requiredSkill) }}</b>，仅可从<b>当班且技能匹配</b>的班组中选择</p>
    </div>

    <div v-if="errorMessage" class="inline-error">{{ errorMessage }}</div>

    <section v-if="eligibleCrews.length" class="crew-group">
      <h4>可派班组（{{ eligibleCrews.length }}）</h4>
      <CrewCard
        v-for="candidate in eligibleCrews"
        :key="candidate.crew.id"
        :candidate="candidate"
        :required-skill="requiredSkill"
        :selected="selectedCrewId === candidate.crew.id"
        @select="selectedCrewId = $event"
      />
    </section>

    <section v-if="occupiedCrews.length" class="crew-group">
      <h4>被占用班组（可尝试派工，将按紧急度判定）</h4>
      <CrewCard
        v-for="candidate in occupiedCrews"
        :key="candidate.crew.id"
        :candidate="candidate"
        :required-skill="requiredSkill"
        :selectable="true"
        :selected="selectedCrewId === candidate.crew.id"
        @select="selectedCrewId = $event"
      />
    </section>

    <section v-if="unqualifiedCrews.length" class="crew-group">
      <h4>不满足条件（非当班 / 技能不匹配）</h4>
      <CrewCard
        v-for="candidate in unqualifiedCrews"
        :key="candidate.crew.id"
        :candidate="candidate"
        :required-skill="requiredSkill"
      />
    </section>

    <template #footer>
      <button class="ghost-btn" @click="emit('close')">取消</button>
      <button class="primary-btn" :disabled="!canSubmit" @click="submit">
        {{ submitting ? "派工中…" : "确认派工" }}
      </button>
    </template>
  </ModalDialog>
</template>
