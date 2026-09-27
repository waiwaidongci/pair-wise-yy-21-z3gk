CREATE TABLE IF NOT EXISTS grid_asset (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(64),
  asset_type VARCHAR(64),
  feeder_line VARCHAR(128),
  voltage_level VARCHAR(16),
  location_desc VARCHAR(255),
  health_status VARCHAR(32),
  owner_team_id INT
);

CREATE TABLE IF NOT EXISTS crew (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128),
  leader_id INT,
  skill_tags TEXT COMMENT '逗号分隔技能标签',
  duty_status VARCHAR(32) COMMENT 'ON_DUTY/OFF_DUTY/REST',
  current_ticket_id INT NULL,
  contact_phone VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporter_name VARCHAR(64),
  phone VARCHAR(32),
  asset_id INT,
  fault_type VARCHAR(32),
  address_desc VARCHAR(255),
  severity VARCHAR(16),
  report_channel VARCHAR(16) COMMENT 'PHONE/WECHAT/WALK_IN/SYSTEM',
  status VARCHAR(32) COMMENT 'PENDING/MERGED/ASSIGNED/REPAIRING/RESTORED/CLOSED',
  ticket_id INT NULL,
  merged_into_ticket_id INT NULL,
  reported_at DATETIME
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fault_report_id INT,
  team_id INT NULL,
  dispatcher_id INT,
  priority VARCHAR(8) COMMENT 'P1/P2/P3/P4',
  status VARCHAR(32) COMMENT 'WAIT_DISPATCH/ASSIGNED/ARRIVED/REPAIRING/RESTORED/CLOSED',
  feeder_line VARCHAR(128),
  fault_type VARCHAR(32),
  address_desc VARCHAR(255),
  merged_report_ids TEXT COMMENT 'JSON 数组合并报修 id',
  created_at DATETIME,
  assigned_at DATETIME NULL,
  arrived_at DATETIME NULL,
  restored_at DATETIME NULL,
  closed_at DATETIME NULL,
  restore_result TEXT NULL,
  conflict_team_id INT NULL,
  conflict_ticket_id INT NULL,
  conflict_reason VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS ticket_event (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  type VARCHAR(32) COMMENT 'CREATE/MERGE/DISPATCH/DISPATCH_CONFLICT/ARRIVE/REPAIRING/RESTORE/CLOSE',
  note VARCHAR(500),
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  part_code VARCHAR(64),
  part_name VARCHAR(128),
  quantity INT,
  warehouse_name VARCHAR(128),
  approved_by VARCHAR(64),
  usage_status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(500),
  target_type VARCHAR(32),
  target_id VARCHAR(64),
  created_at DATETIME
);
