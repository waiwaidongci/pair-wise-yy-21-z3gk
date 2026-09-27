// 故障报修登记请求体：值班员录入来电，服务端负责查重合并或生成工单。
export interface CreateFaultReportPayload {
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
}
