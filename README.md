# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>

## 抢修工单 · 合并派工台

工单页 `/tickets` 是合并派工台，围绕“重复报修合并 → 选班派工 → 到场处理 → 统一复电”一条线设计：

- **后来的报修并入最早一张待处理单**：同馈线、同故障类型、半小时内的来电由
  `POST /api/fault-report/register` 自动并入最早一张 `WAIT_DISPATCH` 工单，不再重复建单。
- **来电号码集中保留**：主单 `caller_phones` 汇聚所有合并报修号码，合并的报修单记录在 `merged_report_ids`。
- **派工按当班 + 技能匹配选班**：`GET /api/repair-ticket/:id/candidates` 返回候选班组，
  只有 `duty_status=ON_DUTY` 且 `skill_tags` 覆盖故障类型、当前空闲的班组可派；
  非当班、技能不匹配、已占用的班组禁用并给出原因。
- **到场后合并报修一起进入处理中**：`POST /api/repair-ticket/:id/arrive` 把主单置为 `ARRIVED`，
  所有合并报修统一进入 `PROCESSING`，随后可“开始处理”。
- **复电统一登记时间和结果**：`POST /api/repair-ticket/:id/restore` 统一写入复电时间与复电结果，
  合并报修一并 `RESTORED`，班组释放。
- **更紧急任务占用 → 退回待派**：派工时若班组已被优先级更高的在途工单占用，
  返回 `409 DISPATCH_CONFLICT`，本次派工退回 `WAIT_DISPATCH`，工单上标出**冲突工单**与**占用原因**；
  班组栏“模拟被更紧急任务占用”按钮（`POST /api/crew/:id/urgent-occupy`）可复现该场景。
  被同等或更低优先级任务占用时返回 `409 CREW_OCCUPIED`，不退回、不打冲突标。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（vite 已配置 `/api` 代理到 `http://localhost:21104`，可用 `VITE_API_TARGET` 覆盖）
- 后端：进入 `backend` 后按技术栈运行开发命令（`npm run dev`，默认 3000 端口，可用 `PORT` 覆盖），接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketPriority（LOW/MEDIUM/HIGH/URGENT，合并派工台新增）：
  - 后端：`backend/src/constants/TicketPriority.ts`（含 `PRIORITY_RANK`，冲突比较）、`models/RepairTicket.ts`、
    `constructors/RepairTicketDtoFactory.ts`、`services/RepairTicketService.ts`（派工冲突）、`services/CrewService.ts`（紧急占用）、`seed.ts`
  - 前端：`frontend/src/constants/TicketPriority.ts`、`constants/statusText.ts`、`constants/crewMatch.ts`、
    `components/common/PriorityTag.vue`、`utils/formatters.ts`、`pages/tickets/*`、`mocks/seedData.ts`
- CrewDutyStatus（ON_DUTY/OFF_DUTY，派工当班判定新增）：
  - 后端：`backend/src/constants/CrewDutyStatus.ts`、`models/Crew.ts`、`services/RepairTicketService.ts`（候选与派工校验）、`seed.ts`
  - 前端：`frontend/src/constants/CrewDutyStatus.ts`、`constants/statusText.ts`、`components/common/StatusBadge.vue`、
    `hooks/useCrewAvailability.ts`、`pages/tickets/CrewDutyPanel.vue`、`mocks/seedData.ts`
- ReportStatus（NEW/MERGED/PROCESSING/RESTORED，合并报修流转新增）：
  - 后端：`backend/src/constants/ReportStatus.ts`、`models/FaultReport.ts`、`services/FaultReportService.ts`（合并）、
    `services/RepairTicketService.ts`（到场/复电联动）、`seed.ts`
  - 前端：`frontend/src/constants/ReportStatus.ts`、`constants/statusText.ts`、`components/common/StatusBadge.vue`、
    `stores/FaultReportStore.ts`、`pages/tickets/TicketCard.vue`、`mocks/seedData.ts`

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。合并派工台即贯穿：报修合并（FaultReportService）、派工选班与冲突（RepairTicketService/CrewService + TicketPriority/CrewDutyStatus）、到场联动（ReportStatus）、复电登记与日志模板/错误码常量。

## License
MIT
