import type { GridAsset } from "./models/GridAsset";
import type { FaultReport } from "./models/FaultReport";
import type { RepairTicket, TicketEvent } from "./models/RepairTicket";
import type { Crew } from "./models/Crew";
import type { SparePartUsage } from "./models/SparePartUsage";

export interface SeedData {
  gridAsset: GridAsset[];
  faultReport: FaultReport[];
  repairTicket: RepairTicket[];
  crew: Crew[];
  sparePartUsage: SparePartUsage[];
}

const ev = (type: TicketEvent["type"], at: string, note: string): TicketEvent => ({ type, at, note });

// 数据种子以“当前时刻”为基准构造，保证合并窗口（30 分钟）在演示时一直有效
const buildSeed = (): SeedData => {
  const now = Date.now();
  const t = (offsetMinutes: number) => new Date(now - offsetMinutes * 60_000).toISOString();

  const gridAsset: GridAsset[] = [
    { id: 1, asset_code: "FD-1021-07", asset_type: "架空线路", feeder_line: "10kV 云江线 F12", voltage_level: "10kV", location_desc: "云江路 17 号杆段", health_status: "DANGEROUS", owner_team_id: 1 },
    { id: 2, asset_code: "KG-2203-11", asset_type: "柱上开关", feeder_line: "10kV 河桥线 F07", voltage_level: "10kV", location_desc: "河桥新村 3 号配电台区", health_status: "WATCH", owner_team_id: 2 },
    { id: 3, asset_code: "SB-3054-02", asset_type: "环网柜", feeder_line: "10kV 南山线 F03", voltage_level: "10kV", location_desc: "南山大道环网柜 G02", health_status: "DEGRADED", owner_team_id: 3 },
    { id: 4, asset_code: "FD-1008-21", asset_type: "电缆分支箱", feeder_line: "10kV 云江线 F12", voltage_level: "10kV", location_desc: "云江工业园门口", health_status: "WATCH", owner_team_id: 1 },
    { id: 5, asset_code: "SB-4011-05", asset_type: "箱式变", feeder_line: "10kV 东港线 F21", voltage_level: "10kV", location_desc: "东港渔港 5 号变", health_status: "NORMAL", owner_team_id: 4 }
  ];

  const faultReport: FaultReport[] = [
    // T1 待派：两起来电将并入同一张单（同线路同故障 30 分钟内）
    { id: 1, reporter_name: "王建国", phone: "13800000001", asset_id: 1, fault_type: "OUTAGE", address_desc: "云江路 17 号附近整片停电", severity: "HIGH", report_channel: "PHONE", status: "PENDING", ticket_id: 1, merged_into_ticket_id: null, reported_at: t(22) },
    { id: 2, reporter_name: "李慧", phone: "13800000002", asset_id: 4, fault_type: "OUTAGE", address_desc: "云江工业园也没电了", severity: "HIGH", report_channel: "PHONE", status: "MERGED", ticket_id: null, merged_into_ticket_id: 1, reported_at: t(9) },
    // T2 已派工，班组正赶去现场（可演示“到场后一起进入处理中”）
    { id: 3, reporter_name: "陈志明", phone: "13800000003", asset_id: 2, fault_type: "TRIP", address_desc: "河桥新村台区开关跳闸，反复合不上", severity: "MEDIUM", report_channel: "PHONE", status: "ASSIGNED", ticket_id: 2, merged_into_ticket_id: null, reported_at: t(46) },
    // T3 处理中，两起合并报修已一起进入处理中
    { id: 4, reporter_name: "赵芳", phone: "13800000004", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "南山大道环网柜异响冒烟", severity: "HIGH", report_channel: "PHONE", status: "REPAIRING", ticket_id: 3, merged_into_ticket_id: null, reported_at: t(95) },
    { id: 5, reporter_name: "孙磊", phone: "13800000005", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "南山大道临街商铺电压不稳", severity: "MEDIUM", report_channel: "WECHAT", status: "MERGED", ticket_id: null, merged_into_ticket_id: 3, reported_at: t(70) },
    // T4 已派工（普通优先级），与 T1 同技能班组可选
    { id: 6, reporter_name: "周敏", phone: "13800000006", asset_id: 4, fault_type: "OUTAGE", address_desc: "云江工业园路灯与门面停电", severity: "LOW", report_channel: "PHONE", status: "ASSIGNED", ticket_id: 4, merged_into_ticket_id: null, reported_at: t(35) },
    // T5 已复电归档示例
    { id: 7, reporter_name: "吴海", phone: "13800000007", asset_id: 5, fault_type: "VOLTAGE_LOW", address_desc: "东港渔村电压偏低，空调启动不了", severity: "LOW", report_channel: "PHONE", status: "RESTORED", ticket_id: 5, merged_into_ticket_id: null, reported_at: t(260) },
    { id: 8, reporter_name: "郑丽", phone: "13800000008", asset_id: 5, fault_type: "VOLTAGE_LOW", address_desc: "东港 5 号变周边电压低", severity: "LOW", report_channel: "WALK_IN", status: "MERGED", ticket_id: null, merged_into_ticket_id: 5, reported_at: t(245) }
  ];

  const repairTicket: RepairTicket[] = [
    {
      id: 1, fault_report_id: 1, team_id: null, dispatcher_id: 1, priority: "P2", status: "WAIT_DISPATCH",
      feeder_line: "10kV 云江线 F12", fault_type: "OUTAGE", address_desc: "云江路 17 号附近整片停电",
      merged_report_ids: [2], created_at: t(22), assigned_at: null, arrived_at: null, restored_at: null, closed_at: null,
      restore_result: null, conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [
        ev("CREATE", t(22), "值班员接听来电话务，新建待处理工单"),
        ev("MERGE", t(9), "13800000002 同线路同故障 30 分钟内重复来电，已并入本单")
      ]
    },
    {
      id: 2, fault_report_id: 3, team_id: 3, dispatcher_id: 1, priority: "P3", status: "ASSIGNED",
      feeder_line: "10kV 河桥线 F07", fault_type: "TRIP", address_desc: "河桥新村台区开关跳闸",
      merged_report_ids: [], created_at: t(46), assigned_at: t(40), arrived_at: null, restored_at: null, closed_at: null,
      restore_result: null, conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [
        ev("CREATE", t(46), "值班员接听来电话务，新建待处理工单"),
        ev("DISPATCH", t(40), "派工给当班且具备倒闸操作技能的班组：配电运检二班")
      ]
    },
    {
      id: 3, fault_report_id: 4, team_id: 4, dispatcher_id: 1, priority: "P1", status: "REPAIRING",
      feeder_line: "10kV 南山线 F03", fault_type: "EQUIPMENT_DAMAGE", address_desc: "南山大道环网柜异响冒烟",
      merged_report_ids: [5], created_at: t(95), assigned_at: t(82), arrived_at: t(60), restored_at: null, closed_at: null,
      restore_result: null, conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [
        ev("CREATE", t(95), "值班员接听来电话务，新建待处理工单"),
        ev("MERGE", t(70), "13800000005 同线路同故障 30 分钟内重复来电，已并入本单"),
        ev("DISPATCH", t(82), "派工给设备抢修班（设备维修技能匹配）"),
        ev("ARRIVE", t(60), "班组到达南山大道现场"),
        ev("REPAIRING", t(60), "合并报修一起进入处理中，正在更换环网柜故障机构")
      ]
    },
    {
      id: 4, fault_report_id: 6, team_id: 2, dispatcher_id: 1, priority: "P4", status: "ASSIGNED",
      feeder_line: "10kV 云江线 F12", fault_type: "OUTAGE", address_desc: "云江工业园路灯与门面停电",
      merged_report_ids: [], created_at: t(35), assigned_at: t(30), arrived_at: null, restored_at: null, closed_at: null,
      restore_result: null, conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [
        ev("CREATE", t(35), "值班员接听来电话务，新建待处理工单"),
        ev("DISPATCH", t(30), "派工给配电运检一班（线路抢修技能匹配）")
      ]
    },
    {
      id: 5, fault_report_id: 7, team_id: 4, dispatcher_id: 1, priority: "P3", status: "RESTORED",
      feeder_line: "10kV 东港线 F21", fault_type: "VOLTAGE_LOW", address_desc: "东港渔村电压偏低",
      merged_report_ids: [8], created_at: t(260), assigned_at: t(250), arrived_at: t(200), restored_at: t(160), closed_at: null,
      restore_result: "更换烧蚀跌落式熔断器一组，调整分接头后电压恢复至 228V，合并报修 2 起均回访正常",
      conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [
        ev("CREATE", t(260), "值班员接听来电话务，新建待处理工单"),
        ev("MERGE", t(245), "重复报修并入本单，来电号码集中保留"),
        ev("DISPATCH", t(250), "派工给设备抢修班"),
        ev("ARRIVE", t(200), "班组到达东港渔港现场"),
        ev("REPAIRING", t(200), "合并报修一起进入处理中"),
        ev("RESTORE", t(160), "统一登记复电时间与处理结果")
      ]
    }
  ];

  const crew: Crew[] = [
    { id: 1, name: "配电运检一班", leader_id: 101, skill_tags: ["LINE_REPAIR", "EMERGENCY_RESCUE"], duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000101" },
    { id: 2, name: "配电运检二班", leader_id: 102, skill_tags: ["LINE_REPAIR", "SWITCH_OPERATION"], duty_status: "ON_DUTY", current_ticket_id: 4, contact_phone: "13900000102" },
    { id: 3, name: "配电运检三班", leader_id: 103, skill_tags: ["SWITCH_OPERATION"], duty_status: "ON_DUTY", current_ticket_id: 2, contact_phone: "13900000103" },
    { id: 4, name: "设备抢修班", leader_id: 104, skill_tags: ["EQUIPMENT_REPAIR", "LINE_REPAIR"], duty_status: "ON_DUTY", current_ticket_id: 3, contact_phone: "13900000104" },
    { id: 5, name: "应急抢修预备队", leader_id: 105, skill_tags: ["EMERGENCY_RESCUE", "LINE_REPAIR", "SWITCH_OPERATION", "EQUIPMENT_REPAIR"], duty_status: "OFF_DUTY", current_ticket_id: null, contact_phone: "13900000105" }
  ];

  const sparePartUsage: SparePartUsage[] = [
    { id: 1, ticket_id: 3, part_code: "HWG-JG-02", part_name: "环网柜操作机构", quantity: 1, warehouse_name: "中心仓", approved_by: "仓管-钱多多", usage_status: "APPROVED" },
    { id: 2, ticket_id: 5, part_code: "RD-15KV-01", part_name: "跌落式熔断器", quantity: 3, warehouse_name: "东港周转仓", approved_by: "仓管-钱多多", usage_status: "CONSUMED" },
    { id: 3, ticket_id: 2, part_code: "KG-KZ-07", part_name: "开关控制模块", quantity: 1, warehouse_name: "中心仓", approved_by: "", usage_status: "PENDING" }
  ];

  return { gridAsset, faultReport, repairTicket, crew, sparePartUsage };
};

export const seed = buildSeed();
