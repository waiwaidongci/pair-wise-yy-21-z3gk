<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

// 轻量页面切换：未引入 vue-router，按路由表映射页面组件。
const pageMap: Record<string, Component> = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
};

const active = ref<string>(routes[3]?.route ?? "/tickets");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[3]);
const activePage = computed(() => pageMap[active.value] ?? TicketsPage);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head"><div><p class="eyebrow">grid-repair</p><h1>{{ current?.name }}</h1></div><StatusBadge value="LOCAL_DATA" kind="raw" /></section>
      <component :is="activePage" />
    </main>
  </div>
</template>
