import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";

export function usePagination<T>(source: MaybeRefOrGetter<T[]> = []) {
  const page = ref(1);
  const pageSize = 8;
  const rows = computed(() => toValue(source));
  const total = computed(() => rows.value.length);
  const pageRows = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize));
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
  return { page, pageSize, pageRows, total, totalPages };
}
