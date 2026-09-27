<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRepairTicketStore } from "../../stores/RepairTicketStore";
import ModalDialog from "../../components/common/ModalDialog.vue";
import { createRestoreForm } from "../../constructors/RepairTicketConstructor";
import type { RepairTicketView } from "../../types/dispatch";

const props = defineProps<{ ticket: RepairTicketView }>();
const emit = defineEmits<{ (e: "close"): void }>();

const store = useRepairTicketStore();
const form = reactive(createRestoreForm());
const submitting = ref(false);

const quickResults = [
  "故障隔离后送电恢复正常",
  "更换故障设备后全线恢复供电",
  "开关重合成功，现场复测正常",
  "消除安全隐患，受影响用户全部复电"
];

const submit = async () => {
  if (!form.restore_result.trim()) {
    store.toast({ type: "error", message: "请填写复电处理结果" });
    return;
  }
  submitting.value = true;
  try {
    await store.restore(props.ticket.id, { restore_result: form.restore_result });
    emit("close");
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <ModalDialog :title="`复电登记 · 工单 #${ticket.id}`" @close="emit('close')">
    <p class="dispatch-summary">
      合并报修 {{ ticket.report_count }} 起将<b>统一登记同一个复电时间和结果</b>，到场时间：{{ ticket.arrived_at ?? "—" }}
    </p>
    <label class="block-label">
      <span>处理结果 / 复电情况</span>
      <textarea v-model="form.restore_result" rows="4" placeholder="请记录抢修措施、复电范围和回访结果"></textarea>
    </label>
    <div class="quick-results">
      <button v-for="text in quickResults" :key="text" type="button" class="chip-btn" @click="form.restore_result = text">
        {{ text }}
      </button>
    </div>
    <template #footer>
      <button class="ghost-btn" @click="emit('close')">取消</button>
      <button class="primary-btn" :disabled="submitting" @click="submit">{{ submitting ? "登记中…" : "统一登记复电" }}</button>
    </template>
  </ModalDialog>
</template>
