<script setup lang="ts">
import { computed } from "vue";
import { formatStatus } from "../../utils/formatters";

const props = defineProps<{ value: string; soft?: boolean }>();

const toneClass = computed(() => {
  switch (props.value) {
    case "WAIT_DISPATCH":
      return "tone-wait";
    case "ASSIGNED":
      return "tone-assigned";
    case "ARRIVED":
      return "tone-arrived";
    case "REPAIRING":
      return "tone-repairing";
    case "RESTORED":
      return "tone-restored";
    case "CLOSED":
      return "tone-closed";
    case "MERGED":
      return "tone-merged";
    case "ON_DUTY":
      return "tone-restored";
    case "OFF_DUTY":
    case "REST":
      return "tone-closed";
    default:
      return "tone-neutral";
  }
});
</script>

<template>
  <span class="badge" :class="[toneClass, { soft }]">{{ formatStatus(value) }}</span>
</template>
