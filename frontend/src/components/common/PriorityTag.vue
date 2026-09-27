<script setup lang="ts">
import { computed } from "vue";
import { TicketPriorityText } from "../../constants/TicketPriority";

// 跨页面共享优先级标签：派工冲突按此顺序比较占用任务与当前工单。
const props = defineProps<{ value: string }>();
const text = computed(() => TicketPriorityText[props.value as keyof typeof TicketPriorityText] ?? props.value);
</script>

<template>
  <span class="priority-tag" :data-value="value">{{ text }}</span>
</template>
