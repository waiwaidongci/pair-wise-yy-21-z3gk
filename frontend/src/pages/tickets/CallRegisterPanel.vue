<script setup lang="ts">
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../../stores/RepairTicketStore";
import { useGridAssetStore } from "../../stores/GridAssetStore";
import { createCallRegisterForm } from "../../constructors/RepairTicketConstructor";
import { FaultType, FaultTypeText } from "../../constants/FaultType";
import { MERGE_WINDOW_MINUTES, formatFaultType, formatSeverity } from "../../utils/formatters";

const store = useRepairTicketStore();
const assetStore = useGridAssetStore();
const { rows: assets } = storeToRefs(assetStore);

const form = reactive(createCallRegisterForm({ asset_id: 1 }));
const submitting = ref(false);
const hint = ref("");

const faultTypes = FaultType;
const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const selectedAsset = () => assets.value.find((asset) => asset.id === Number(form.asset_id));

// 提交前预判：同线路同故障 30 分钟内已有待处理单时提示将并入
const previewMerge = (): string => {
  const asset = selectedAsset();
  if (!asset) return "";
  const target = store.rows
    .filter((ticket) => ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status))
    .filter((ticket) => ticket.feeder_line === asset.feeder_line)
    .filter((ticket) => ticket.fault_type === form.fault_type)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
  if (target && new Date(target.created_at).getTime() + MERGE_WINDOW_MINUTES * 60_000 >= Date.now()) {
    return `将并入最早待处理单 #${target.id}（${target.feeder_line} · ${formatFaultType(target.fault_type)}），号码集中保留`;
  }
  return "未匹配到同线路同故障待处理单，将新建一张待派工单";
};

const updateHint = () => {
  hint.value = previewMerge();
};

const submit = async () => {
  if (!form.phone.trim() || !form.reporter_name.trim()) {
    store.toast({ type: "error", message: "请填写来电号码和报修人" });
    return;
  }
  submitting.value = true;
  try {
    await store.registerCall({ ...form, asset_id: Number(form.asset_id) });
    form.phone = "";
    form.reporter_name = "";
    form.address_desc = "";
  } finally {
    submitting.value = false;
    updateHint();
  }
};

updateHint();
</script>

<template>
  <div class="panel call-panel">
    <h2>来电登记 · 自动合并</h2>
    <p class="panel-tip">同线路、同故障类型 {{ MERGE_WINDOW_MINUTES }} 分钟内的重复来电，自动并入最早一张待处理单</p>
    <form class="call-form" @submit.prevent="submit">
      <label>
        <span>来电号码</span>
        <input v-model="form.phone" placeholder="如 13800000001" @input="updateHint" />
      </label>
      <label>
        <span>报修人</span>
        <input v-model="form.reporter_name" placeholder="报修人姓名" />
      </label>
      <label>
        <span>故障线路 / 设备</span>
        <select v-model="form.asset_id" @change="updateHint">
          <option v-for="asset in assets" :key="asset.id" :value="asset.id">
            {{ asset.feeder_line }} · {{ asset.location_desc }}
          </option>
        </select>
      </label>
      <div class="form-grid">
        <label>
          <span>故障类型</span>
          <select v-model="form.fault_type" @change="updateHint">
            <option v-for="value in faultTypes" :key="value" :value="value">{{ FaultTypeText[value] }}</option>
          </select>
        </label>
        <label>
          <span>故障分级</span>
          <select v-model="form.severity">
            <option v-for="value in severities" :key="value" :value="value">{{ formatSeverity(value) }}</option>
          </select>
        </label>
      </div>
      <label>
        <span>报修渠道</span>
        <select v-model="form.report_channel">
          <option value="PHONE">电话</option>
          <option value="WECHAT">微信</option>
          <option value="WALK_IN">上门</option>
          <option value="SYSTEM">系统</option>
        </select>
      </label>
      <label>
        <span>故障描述</span>
        <textarea v-model="form.address_desc" rows="2" placeholder="现场情况描述"></textarea>
      </label>
      <p class="merge-hint" :class="{ merge: hint.indexOf('未匹配') !== 0 }">{{ hint }}</p>
      <button type="submit" class="primary-btn" :disabled="submitting">{{ submitting ? "登记中…" : "登记来电" }}</button>
    </form>
  </div>
</template>
