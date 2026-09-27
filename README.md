# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>

## 核心功能：抢修工单 · 合并派工台（/tickets）

值班员靠电话判断，同线路半小时内相同故障常被重复建单，到场和复电结果也分散。合并派工台把报修合并、派工、到场、复电集中在一张工作台：

1. **来电登记自动合并**：同一线路、同一故障类型、30 分钟合并窗口内已有待处理工单时，后来的报修并入最早一张待处理单；所有来电号码在工单上集中保留、去重展示。登记前页面会预判提示“将并入 #N / 将新建工单”。
2. **受限派工**：派工只从**当班且技能匹配**的班组中选择（故障类型 → 必备技能映射）；非当班、技能不匹配、被占用的班组在候选列表中单独标出原因。
3. **到场即处理**：班组到场后，主报修与全部合并报修一起进入“处理中”，时间线留痕。
4. **统一复电**：复电时对整个工单（含全部合并报修）统一登记复电时间和处理结果，班组自动释放。
5. **派工冲突退回**：若班组刚被更紧急任务占用（对方优先级更高），本次派工退回待派，工单上以红色横幅标出**冲突工单号、占用班组和占用原因**，改派成功后自动清除。

### 派工台 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/repair-ticket` | 工单视图列表（含合并报修、号码汇总、时间线） |
| POST | `/api/repair-ticket/calls` | 来电登记（自动合并或新建） |
| GET | `/api/repair-ticket/:id/candidates` | 派工候选班组（当班+技能+占用原因） |
| POST | `/api/repair-ticket/:id/dispatch` | 派工；更紧急占用时返回 409 `CREW_CONFLICT` 并标出冲突 |
| POST | `/api/repair-ticket/:id/arrive` | 到场，合并报修一起进入处理中 |
| POST | `/api/repair-ticket/:id/restore` | 统一复电登记（`restore_result` 必填） |
| POST | `/api/repair-ticket/:id/close` | 归档 |

写操作要求 `x-role: admin|dispatcher`（RBAC 中间件校验）。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（`/api` 代理到 `BACKEND_PORT`，默认 3000）
- 后端：`cd backend && npm install && npm run dev`，接口统一挂在 `/api`。
- 前端在后端不可达时自动回退到内置 mock 引擎（`frontend/src/mocks/mockServer.ts`），离线也能完整演示合并、派工冲突、到场、复电全流程。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, pages/tickets, router, utils, mocks
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

- FaultType: `constants/FaultType`（前后端）、`types/FaultType`、constructors、logTemplates、errorMessages、筛选器（来电登记表单）、展示组件（TicketCard）均有引用。
- TicketStatus: `constants/TicketStatus`（前后端）、`types/TicketStatus`、constructors、logTemplates、errorMessages、useTicketFlow 分组、StatusBadge 展示均有引用。
- AssetHealthStatus: `constants/AssetHealthStatus`（前后端）、`types/AssetHealthStatus`、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- Priority: `constants/Priority`（前后端），含 P1-P4 优先级、严重度映射与 `isMoreUrgent` 冲突比较，PriorityTag、dispatchPolicy、mockServer 引用。
- SkillTag: `constants/SkillTag`（前后端），含故障类型 → 必备技能映射，CrewCard、useCrewAvailability、dispatchPolicy 引用。
- CrewDutyStatus: `constants/CrewDutyStatus`（前后端），派工候选过滤与 CrewCard 展示引用。
- ReportStatus: `constants/ReportStatus`（前后端），合并报修随工单流转的状态枚举，报修状态徽标引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。合并派工台的每条业务规则（30 分钟合并窗口、技能匹配、紧急度比较）在 `backend/src/services/*Policy.ts` 与 `frontend/src/mocks/mockServer.ts` 各有一份实现，调整规则时必须两侧同步。

## License

MIT
