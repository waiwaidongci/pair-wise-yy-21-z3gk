<script setup lang="ts">
import { computed } from "vue";
import { formatPriority } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const toneClass = computed(() => `priority-${(props.value || "P3").toLowerCase()}`);
</script>

<template>
  <span class="priority-tag" :class="toneClass">
    <i>{{ value }}</i>{{ formatPriority(value) }}
  </span>
</template>
