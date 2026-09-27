// 本地种子数据：与 backend/src/seed.ts 保持一致，接口不可用时兜底展示。
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const mockData = {
  gridAsset: [
    { id: 1, asset_code: "BYQ-HQ-01", asset_type: "配电变压器", feeder_line: "10kV红旗线F1", voltage_level: "10kV", location_desc: "红旗路12号杆变台区", health_status: "WATCH", owner_team_id: 1 },
    { id: 2, asset_code: "KG-HQ-02", asset_type: "柱上开关", feeder_line: "10kV红旗线F1", voltage_level: "10kV", location_desc: "红旗路28号杆开关", health_status: "NORMAL", owner_team_id: 2 },
    { id: 3, asset_code: "DL-BH-03", asset_type: "低压电缆", feeder_line: "10kV滨河线F2", voltage_level: "0.4kV", location_desc: "滨河小区3号箱变出线", health_status: "DEGRADED", owner_team_id: 3 }
  ],
  faultReport: [
    { id: 1, reporter_name: "王建国", phone: "13800000001", asset_id: 1, fault_type: "OUTAGE", address_desc: "红旗路12号杆变台区停电", severity: "HIGH", report_channel: "95598热线", status: "MERGED", reported_at: minutesAgo(18), merged_ticket_id: 1 },
    { id: 2, reporter_name: "李秀兰", phone: "13800000002", asset_id: 2, fault_type: "OUTAGE", address_desc: "红旗路28号杆附近多户停电", severity: "MEDIUM", report_channel: "95598热线", status: "MERGED", reported_at: minutesAgo(6), merged_ticket_id: 1 },
    { id: 3, reporter_name: "张伟", phone: "13800000003", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "滨河小区3号箱变异响发热", severity: "MEDIUM", report_channel: "微信公众号", status: "MERGED", reported_at: minutesAgo(40), merged_ticket_id: 2 },
    { id: 4, reporter_name: "陈静", phone: "13800000004", asset_id: 3, fault_type: "VOLTAGE_LOW", address_desc: "滨河小区晚高峰电压偏低", severity: "LOW", report_channel: "95598热线", status: "MERGED", reported_at: minutesAgo(90), merged_ticket_id: 3 },
    { id: 5, reporter_name: "刘志强", phone: "13800000005", asset_id: 1, fault_type: "TRIP", address_desc: "红旗路12号杆变台区反复跳闸", severity: "HIGH", report_channel: "95598热线", status: "MERGED", reported_at: minutesAgo(50), merged_ticket_id: 4 },
    { id: 6, reporter_name: "赵敏", phone: "13800000006", asset_id: 2, fault_type: "SAFETY_RISK", address_desc: "红旗路28号杆开关冒烟，有明火风险", severity: "URGENT", report_channel: "110联动", status: "MERGED", reported_at: minutesAgo(25), merged_ticket_id: 5 },
    { id: 7, reporter_name: "孙鹏", phone: "13800000007", asset_id: 1, fault_type: "OUTAGE", address_desc: "红旗路12号杆变台区全停（紧急）", severity: "URGENT", report_channel: "95598热线", status: "MERGED", reported_at: minutesAgo(10), merged_ticket_id: 900 }
  ],
  repairTicket: [
    { id: 1, fault_report_id: 1, team_id: 0, dispatcher_id: 0, priority: "HIGH", status: "WAIT_DISPATCH", assigned_at: "", restored_at: "", fault_type: "OUTAGE", feeder_line: "10kV红旗线F1", address_desc: "红旗路12号杆变台区停电", caller_phones: ["13800000001", "13800000002"], merged_report_ids: [1, 2], arrived_at: null, restore_result: null, conflict_ticket_id: null, conflict_reason: null },
    { id: 2, fault_report_id: 3, team_id: 7, dispatcher_id: 1, priority: "MEDIUM", status: "ASSIGNED", assigned_at: minutesAgo(35), restored_at: "", fault_type: "EQUIPMENT_DAMAGE", feeder_line: "10kV滨河线F2", address_desc: "滨河小区3号箱变异响发热", caller_phones: ["13800000003"], merged_report_ids: [3], arrived_at: null, restore_result: null, conflict_ticket_id: null, conflict_reason: null },
    { id: 3, fault_report_id: 4, team_id: 2, dispatcher_id: 1, priority: "LOW", status: "ARRIVED", assigned_at: minutesAgo(80), restored_at: "", fault_type: "VOLTAGE_LOW", feeder_line: "10kV滨河线F2", address_desc: "滨河小区晚高峰电压偏低", caller_phones: ["13800000004"], merged_report_ids: [4], arrived_at: minutesAgo(55), restore_result: null, conflict_ticket_id: null, conflict_reason: null },
    { id: 4, fault_report_id: 5, team_id: 3, dispatcher_id: 1, priority: "HIGH", status: "REPAIRING", assigned_at: minutesAgo(45), restored_at: "", fault_type: "TRIP", feeder_line: "10kV红旗线F1", address_desc: "红旗路12号杆变台区反复跳闸", caller_phones: ["13800000005"], merged_report_ids: [5], arrived_at: minutesAgo(30), restore_result: null, conflict_ticket_id: null, conflict_reason: null },
    { id: 5, fault_report_id: 6, team_id: 4, dispatcher_id: 1, priority: "URGENT", status: "ASSIGNED", assigned_at: minutesAgo(20), restored_at: "", fault_type: "SAFETY_RISK", feeder_line: "10kV红旗线F1", address_desc: "红旗路28号杆开关冒烟，有明火风险", caller_phones: ["13800000006"], merged_report_ids: [6], arrived_at: null, restore_result: null, conflict_ticket_id: null, conflict_reason: null },
    { id: 6, fault_report_id: 0, team_id: 1, dispatcher_id: 1, priority: "MEDIUM", status: "RESTORED", assigned_at: minutesAgo(300), restored_at: minutesAgo(180), fault_type: "OUTAGE", feeder_line: "10kV滨河线F2", address_desc: "滨河小区1号箱变低压侧故障停电", caller_phones: ["13800000008"], merged_report_ids: [], arrived_at: minutesAgo(270), restore_result: "更换低压熔断器后复电正常", conflict_ticket_id: null, conflict_reason: null },
    { id: 7, fault_report_id: 0, team_id: 2, dispatcher_id: 1, priority: "LOW", status: "CLOSED", assigned_at: minutesAgo(1500), restored_at: minutesAgo(1380), fault_type: "VOLTAGE_LOW", feeder_line: "10kV红旗线F1", address_desc: "红旗路末端台区电压偏低（已归档）", caller_phones: ["13800000009"], merged_report_ids: [], arrived_at: minutesAgo(1470), restore_result: "调整分接头后电压恢复正常", conflict_ticket_id: null, conflict_reason: null },
    { id: 900, fault_report_id: 7, team_id: 5, dispatcher_id: 1, priority: "URGENT", status: "ASSIGNED", assigned_at: minutesAgo(8), restored_at: "", fault_type: "OUTAGE", feeder_line: "10kV红旗线F1", address_desc: "红旗路12号杆变台区全停（紧急）", caller_phones: ["13800000007"], merged_report_ids: [7], arrived_at: null, restore_result: null, conflict_ticket_id: null, conflict_reason: null }
  ],
  crew: [
    { id: 1, name: "配电抢修一班", leader_id: 1, skill_tags: "OUTAGE,VOLTAGE_LOW", duty_status: "ON_DUTY", current_ticket_id: 0, contact_phone: "13900000001", occupied_reason: null },
    { id: 2, name: "配电抢修二班", leader_id: 2, skill_tags: "VOLTAGE_LOW,TRIP", duty_status: "ON_DUTY", current_ticket_id: 3, contact_phone: "13900000002", occupied_reason: "滨河小区晚高峰电压偏低" },
    { id: 3, name: "带电作业班", leader_id: 3, skill_tags: "OUTAGE,TRIP", duty_status: "ON_DUTY", current_ticket_id: 4, contact_phone: "13900000003", occupied_reason: "红旗路12号杆变台区反复跳闸" },
    { id: 4, name: "电缆抢修班", leader_id: 4, skill_tags: "EQUIPMENT_DAMAGE,SAFETY_RISK", duty_status: "ON_DUTY", current_ticket_id: 5, contact_phone: "13900000004", occupied_reason: "红旗路28号杆开关冒烟，有明火风险" },
    { id: 5, name: "综合应急班", leader_id: 5, skill_tags: "OUTAGE,EQUIPMENT_DAMAGE,SAFETY_RISK", duty_status: "ON_DUTY", current_ticket_id: 900, contact_phone: "13900000005", occupied_reason: "红旗路12号杆变台区全停（紧急）" },
    { id: 6, name: "夜间备勤班", leader_id: 6, skill_tags: "OUTAGE,VOLTAGE_LOW,TRIP", duty_status: "OFF_DUTY", current_ticket_id: 0, contact_phone: "13900000006", occupied_reason: null },
    { id: 7, name: "配电抢修三班", leader_id: 7, skill_tags: "EQUIPMENT_DAMAGE,VOLTAGE_LOW", duty_status: "ON_DUTY", current_ticket_id: 2, contact_phone: "13900000007", occupied_reason: "滨河小区3号箱变异响发热" }
  ],
  sparePartUsage: [
    { id: 1, ticket_id: 4, part_code: "RDQ-10-50", part_name: "10kV跌落式熔断器", quantity: 2, warehouse_name: "中心库", approved_by: "调度员01", usage_status: "CONSUMED" },
    { id: 2, ticket_id: 2, part_code: "KG-12-630", part_name: "柱上开关触头", quantity: 1, warehouse_name: "中心库", approved_by: "调度员01", usage_status: "APPLIED" },
    { id: 3, ticket_id: 6, part_code: "BX-04-95", part_name: "0.4kV低压熔断器", quantity: 3, warehouse_name: "东区库", approved_by: "调度员02", usage_status: "CONSUMED" }
  ]
};
