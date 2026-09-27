<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useFaultReportStore } from "../../stores/FaultReportStore";
import { useGridAssetStore } from "../../stores/GridAssetStore";
import { FaultType, FaultTypeText } from "../../constants/FaultType";
import { TicketPriorityText } from "../../constants/TicketPriority";
import { ApiError } from "../../api/http";
import { createFaultReportForm } from "../../constructors/FaultReportConstructor";

// 值班员登记来电：同线路同故障半小时内的报修由后端并入最早待派工单。
const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();

const emit = defineEmits<{
  (e: "registered"): void;
  (e: "message", payload: { type: "success" | "error" | "info"; text: string }): void;
}>();

const severities = Object.entries(TicketPriorityText);
const faultTypes = FaultType.map((value) => ({ value, label: FaultTypeText[value] }));

const form = reactive(createFaultReportForm());
const submitting = ref(false);

const assets = computed(() => assetStore.rows);

const submit = async () => {
  if (!form.reporter_name || !form.phone || !form.asset_id || !form.address_desc) {
    emit("message", { type: "error", text: "请完整填写报修人、来电号码、线路资产和故障描述" });
    return;
  }
  submitting.value = true;
  try {
    const result = await faultStore.register({
      reporter_name: form.reporter_name,
      phone: form.phone,
      asset_id: Number(form.asset_id),
      fault_type: form.fault_type,
      address_desc: form.address_desc,
      severity: form.severity,
      report_channel: form.report_channel || "95598热线"
    });
    if (result.merged) {
      emit("message", { type: "info", text: `重复报修已并入最早待派工单#${result.ticket.id}，来电号码已集中保留` });
    } else {
      emit("message", { type: "success", text: `新故障已生成待派工单#${result.ticket.id}` });
    }
    form.reporter_name = "";
    form.phone = "";
    form.address_desc = "";
    emit("registered");
  } catch (error) {
    emit("message", { type: "error", text: error instanceof ApiError ? error.message : "登记失败，请稍后再试" });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="panel">
    <h2>登记来电报修</h2>
    <form class="register-form" @submit.prevent="submit">
      <label>报修人<input v-model="form.reporter_name" placeholder="来电人姓名" /></label>
      <label>来电号码<input v-model="form.phone" placeholder="如 13800000001" /></label>
      <label>
        线路 / 资产
        <select v-model="form.asset_id">
          <option :value="0" disabled>请选择故障资产</option>
          <option v-for="asset in assets" :key="asset.id" :value="asset.id">
            {{ asset.feeder_line }} · {{ asset.location_desc }}
          </option>
        </select>
      </label>
      <label>
        故障类型
        <select v-model="form.fault_type">
          <option v-for="item in faultTypes" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </label>
      <label>
        紧急程度
        <select v-model="form.severity">
          <option v-for="[value, label] in severities" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>故障描述<textarea v-model="form.address_desc" rows="2" placeholder="现场现象 / 影响范围"></textarea></label>
      <button class="btn primary block" :disabled="submitting" type="submit">{{ submitting ? "提交中…" : "登记并自动查重合并" }}</button>
    </form>
    <p class="hint">同线路、同故障类型、半小时内的重复来电会并入最早一张待处理工单。</p>
  </div>
</template>
