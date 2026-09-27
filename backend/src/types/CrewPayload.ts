// 班组紧急占用请求体：模拟班组刚被更紧急任务占用，用于触发派工冲突。
export interface UrgentOccupyPayload {
  fault_type: string;
  address_desc: string;
  priority?: string;
}
