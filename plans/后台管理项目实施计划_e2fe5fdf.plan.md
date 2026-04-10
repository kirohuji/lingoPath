---
name: 后台管理项目实施计划
overview: 基于 echoon 的 NestJS + React 架构，规划一个仅含 backend/frontend 的后台管理系统，覆盖登录鉴权、通知、会员积分、教材库/分类树、工单与通用后台能力。首期第三方登录仅保留 OAuth2 抽象与占位接口。
todos:
  - id: bootstrap-monorepo
    content: 建立 pnpm monorepo，初始化 backend/frontend 基础工程和统一规范
    status: completed
  - id: env-config-secrets
    content: 建立多环境配置与 secrets 管理规范（dev/test/prod）
    status: completed
  - id: prisma-migration-seed
    content: 建立 Prisma 迁移与种子数据策略（默认管理员、角色、权限树）
    status: completed
  - id: redis-cache-baseline
    content: 接入 Redis 并建立 token 黑名单、权限缓存、未读数缓存、限流基础能力
    status: completed
  - id: logging-tracing
    content: 建立系统日志与审计日志双轨方案，增加 requestId 链路追踪
    status: completed
  - id: queue-scheduler
    content: 建立 Schedule/BullMQ 任务体系用于工单超时、通知归档、文件清理等任务
    status: completed
  - id: auth-rbac-foundation
    content: 实现 JWT 鉴权、RBAC、用户管理与 OAuth2 占位接口
    status: completed
  - id: category-tag-domain
    content: 实现三级分类树与标签库管理及其约束
    status: completed
  - id: textbook-domain
    content: 实现教材库与分集管理，支持标签关联、筛选和上传
    status: completed
  - id: membership-points
    content: 实现积分账本、等级规则和会员等级计算
    status: completed
  - id: ticket-workflow
    content: 实现工单流转、回复与处理记录
    status: cancelled
  - id: notification-realtime
    content: 实现通知 CRUD、未读统计和 NestJS WebSocket 实时推送
    status: completed
  - id: frontend-permission-guards
    content: 实现前端 Route/Component 双层权限守卫和 403 页面
    status: completed
  - id: frontend-admin-shell
    content: 实现后台 layout、路由分层懒加载、通用表格/弹窗/表单/上传/markdown 组件封装
    status: completed
  - id: hardening-and-tests
    content: 补齐审计日志、系统配置、关键接口测试与联调验收
    status: completed
isProject: false
---

# LingoPath（言途学社）后台管理项目实施计划

## 目标与边界
- 项目名称：`LingoPath`（中文名：`言途学社`）。
- 目标：交付 LingoPath（言途学社）可持续扩展的后台管理系统（`backend` + `frontend`），优先完成你列出的 6 大业务模块与通用基础能力。
- 技术栈：`NestJS + Prisma + PostgreSQL`、`React + Vite + shadcn/ui + React Hook Form + Zod + Zustand + Axios + react-dropzone + Markdown`、包管理 `pnpm`。
- 第三方登录：首期不接真实平台，先实现 OAuth2 抽象层（provider 配置、回调占位、可扩展接口）。
- 交付级别：MVP 阶段同步落地系统级基础设施（配置、缓存、日志、迁移、调度、守卫），保证可上线与可维护。

## 参考 echoon 的可复用架构（提炼）
- 后端模块化：参考 `echoon` 的 `Auth / Membership / Notification / Realtime / Ticket / Tag` 模块拆分方式。
- WebSocket：参考 `echoon` 的 JWT 握手鉴权 + `user:{userId}` 房间推送模型。
- 前端路由：按 `routes/sections` 分文件组织，配合懒加载与 `Suspense` 骨架。
- API 层：统一 Axios 实例 + 请求/响应拦截器，模块化 `modules/*.ts` 封装。

## 新项目目录规划（Monorepo）
- 根目录：
  - `package.json`
  - `pnpm-workspace.yaml`
  - `apps/backend`
  - `apps/frontend`
  - `packages/shared-types`（前后端共享类型、错误码、常量）
- 后端：
  - `apps/backend/src/modules/{auth,user,rbac,notification,realtime,membership,textbook,category,ticket,upload}`
  - `apps/backend/src/infrastructure/{cache,queue,logger,config}`
  - `apps/backend/prisma/schema.prisma`
- 前端：
  - `apps/frontend/src/{app,layouts,routes,pages,modules,stores,components}`
  - `apps/frontend/src/components/ui`（shadcn 基础组件 + 二次封装）

## 容器化与部署编排（Docker Compose + Nginx）

### 1) 编排目标
- 支持两种模式：`内置基础设施`（compose 启 Postgres/Redis）与 `复用现有基础设施`（仅启业务服务）。
- 统一入口：Nginx 负责前端静态资源与 `/api`、`/socket.io` 反向代理。
- 保证本地联调与准生产部署配置一致，降低环境差异。

### 2) 服务拓扑
- `frontend`：React 管理端（构建产物由 Nginx 托管，或开发模式独立容器）。
- `backend`：NestJS API + WebSocket 网关。
- `worker`：BullMQ worker（队列任务消费者，和 backend 分离部署）。
- `nginx`：统一网关（TLS 可后续接入）。
- `postgres`、`redis`：按模式决定是否启用。

### 3) 复用现有 Postgres/Redis 的方案（你当前可优先采用）
- 使用 `docker-compose.yml` 启 `backend + worker + nginx + frontend`。
- 不启动 `postgres/redis` 服务，改为读取外部连接：
  - `DATABASE_URL=postgresql://...`
  - `REDIS_HOST/REDIS_PORT/REDIS_PASSWORD`（或 `REDIS_URL`）
- 通过 `profiles` 或覆盖文件管理：
  - `docker-compose.yml`（默认外部依赖）
  - `docker-compose.with-infra.yml`（追加 postgres/redis）
- 健康检查：`backend` 在启动前主动探活数据库与 Redis，失败则重试并退出。

### 4) 内置 Postgres/Redis 的方案（备选）
- 增加 `postgres`、`redis` 服务与持久化卷：
  - `postgres_data`、`redis_data`、`uploads_data`。
- `backend/worker` 使用容器内 DNS（`postgres:5432`、`redis:6379`）。
- 开启 `depends_on + healthcheck`，确保按依赖顺序启动。

### 5) Nginx 配置要求（必须项）
- 路由转发：
  - `/` -> 前端静态资源（history fallback 到 `index.html`）
  - `/api/` -> `backend:3000`
  - `/socket.io/` -> `backend:3000`（开启 Upgrade/Connection 头）
- 超时与上传：
  - `client_max_body_size` 按上传需求配置（如 `20m`）。
  - `proxy_read_timeout` 为 WebSocket/长请求适当放宽。
- 安全与头部：
  - 转发 `X-Request-Id`（无则生成）用于链路追踪。
  - 基础安全头（`X-Content-Type-Options`、`X-Frame-Options` 等）。

### 6) 环境变量与文件约定
- `.env.compose`：Compose 层变量（端口、镜像 tag、profile）。
- `apps/backend/.env.*`：业务配置（DB/JWT/Redis/Queue/OAuth）。
- `apps/frontend/.env.*`：前端配置（API Base URL、Socket URL）。
- 约束：敏感信息不提交仓库，使用 `.env.example` 维护模板。

### 7) 验收标准（容器化）
- 在“复用现有 Postgres/Redis”模式下，`docker compose up -d` 后系统可完整运行。
- 在“内置基础设施”模式下，切换 profile 后可一键拉起并通过健康检查。
- Nginx 下 API 与 WebSocket 均可正常访问，前端刷新路由无 404。

## 后端实施方案（NestJS）

### 系统级基础设施（新增）
- 多环境与配置：`.env.local/.env.development/.env.test/.env.production`，配置域拆分 `database/jwt/oauth/upload/websocket/redis/queue`。
- 迁移与种子：开发 `prisma migrate dev`，生产 `prisma migrate deploy`，并提供 `prisma db seed` 初始化管理员、角色与权限树。
- Redis 基线：refresh token 黑名单、权限缓存、通知未读数缓存、登录和敏感接口限流。
- 日志与追踪：业务审计日志 + 系统日志（request/error/performance），引入 `requestId` 贯穿 API 与 WebSocket。
- 调度与队列：`@nestjs/schedule` + `BullMQ`，用于工单超时、通知归档、垃圾文件清理、积分对账任务。

### 架构原则（新增）
- 采用 `DDD` 分层：`Interface(Controller/Gateway)`、`Application(UseCase)`、`Domain(Entity/Repository Interface/Domain Service)`、`Infrastructure(Prisma/外部服务实现)`。
- 对外 API 严格采用 `RESTful` 风格：资源化路径、语义化 HTTP 方法、统一分页/筛选参数、统一错误码与响应结构。
- API 版本化：统一前缀 `/api/v1`，后续通过 `/api/v2` 平滑升级。
- 业务模块按边界上下文拆分：`auth`、`membership`、`textbook`、`category`、`ticket`、`notification`，模块内遵循 DDD，模块间通过应用服务协作。
- 先做“轻量 DDD”（不追求过度抽象），在保证开发效率的前提下建立清晰边界，便于后续演进。

### shared 包与通用能力（新增）
- 新增 `apps/backend/src/shared`（或 `packages/shared-backend`）承载跨模块通用代码，避免污染业务域。
- 建议包含：
  - `shared/base`：`BaseCrudService<TEntity,TCreate,TUpdate,TQuery>`、`BaseController`（仅封装通用分页/排序/软删能力）。
  - `shared/dto`：`PageQueryDto`、`PageResultDto`、`IdParamDto`、`BatchIdsDto`。
  - `shared/guards`：`JwtAuthGuard`、`PermissionGuard`。
  - `shared/decorators`：`CurrentUser`、`RequirePermissions`。
  - `shared/constants`：错误码、分页默认值、缓存 key。
  - `shared/utils`：查询条件构建器、时间与脱敏工具。
  - `shared/exceptions`：业务异常基类与统一异常映射。
- 约束：shared 只放“跨域通用能力”，禁止放具体业务规则（如积分升级规则、工单流转规则）。

### 通用泛型 service 设计边界（新增）
- 可以写通用基类提升 CRUD 开发效率，适用于：后台管理型实体（标签、分类节点、通知模板等）。
- 不建议强行泛化：复杂业务域（会员积分记账、工单状态机、教材分集发布）应保留独立 Application/Domain Service。
- 组合方式：`通用基类 + 业务服务覆写钩子`（如 `beforeCreate`、`beforeUpdate`、`afterDelete`），兼顾复用与业务表达。

### 1) 登录注册与权限管理
- `auth`：`/auth/register`、`/auth/login`、`/auth/refresh`、`/auth/logout`、`/auth/me`。
- 鉴权：JWT Access + Refresh Token（可选 HttpOnly cookie）。
- RBAC：`Role`、`Permission`、`RoleAssignment` 三表；Guard + Decorator 实现接口级权限控制。
- 权限粒度：`menu`、`api`、`button` 三层模型，`/me` 返回 `permissions + menus` 供前端动态路由与按钮鉴权。
- OAuth2 占位：`/auth/oauth/:provider/start`、`/auth/oauth/:provider/callback`（先返回未启用/占位信息，后续可热插真实 provider）。

### 2) 消息通知（WebSocket）
- `@nestjs/websockets` + Socket.IO。
- 握手阶段验证 JWT，成功后加入 `user:{userId}` 房间。
- 事件：
  - 服务端推送：`notifications:created`、`notifications:changed`
  - 客户端动作：`notifications:read`（可选）
- REST 配套：通知列表、未读数、已读、全已读、删除。

### 3) 会员积分（三等级）
- 等级：`L1/L2/L3`（由积分区间驱动，不手工硬编码状态）。
- 数据模型：`MembershipAccount(points,currentLevel)` + `PointsLedger(change,reason,bizId)`。
- 规则：积分变更统一走 service（工单处理、上传教材、管理员手工加减分等）。
- 接口：积分账本分页、等级查询、规则配置（管理员）。
- 一致性：积分变更必须使用事务，并采用行级锁或乐观锁（`version` 字段）避免并发覆盖。

### 4) 教材库（分集 + 标签）
- `Textbook`（教材主表）+ `TextbookEpisode`（分集）+ `TextbookTagRelation`（多标签）。
- 支持字段：封面、描述、状态、排序、发布日期。
- CRUD：教材与分集分别增删改查；支持按标签/分类/关键词筛选。
- 搜索能力：首期 `LIKE + 标签过滤 + 分类过滤 + 排序`，后续可升级 PostgreSQL Full-Text Search。

### 5) 分类库（三层树）
- `Category` 自关联树结构：`id,parentId,level,name,sort,status,path`。
- 约束：最多三层；同父节点下名称唯一；删除需校验子节点与教材关联。
- 接口：树查询、节点 CRUD、拖拽排序（通过 `sort`）。

### 6) 工单管理
- `Ticket` + `TicketReply` + `TicketLog`。
- 状态流转：`open -> processing -> resolved/closed`。
- 功能：创建工单、分配处理人、回复、状态变更、优先级、分页筛选。

### 7) 基础后台必备能力（建议纳入首期）
- 用户管理（后台）：用户列表、启停用、角色分配、重置密码。
- 操作审计：关键 CRUD 与权限变更写审计日志。
- 文件上传：本地/对象存储适配层 + 元数据表。
- 系统配置：积分规则、上传限制、通知模板等可配置。
- 健康检查与错误规范：统一响应结构、异常过滤器、参数校验。
- 上传闭环：文件状态（`uploading/uploaded/failed`）、归属（`userId + bizType`）、定时清理垃圾文件。
- 错误码体系：`AUTH_* / USER_* / FILE_* / TICKET_* / SYSTEM_*` 分域管理。
- 性能基线：分页上限（默认 `limit <= 100`）、按需 select 字段、避免 N+1 查询。

## 前端实施方案（React + shadcn/ui）

### 1) 路由分层与懒加载
- 路由结构：`routes/sections/{auth,main}.tsx` + `routes/paths.ts`。
- 页面级懒加载：`React.lazy` + `Suspense`。
- 骨架屏：列表页和详情页统一 Skeleton 组件。

### 2) Layout 与页面骨架
- `MainLayout`：侧边栏、顶部栏、内容区。
- 权限菜单：基于后端权限点动态渲染。
- 页面清单：用户、通知、会员积分、教材库、分类库、工单、系统设置。
- 权限守卫：Route Guard + Component Guard（按钮级）+ `403` 页面。

### 3) 通用组件二次封装
- 封装目标：`DataTable`、`FormDialog`、`ConfirmDialog`、`FilterBar`、`UploadDropzone`、`MarkdownEditor/Preview`。
- 表单：`React Hook Form + Zod` 统一校验与错误展示。
- 上传：`react-dropzone` 与上传 API 对接，支持进度与失败重试。

### 4) 状态与请求层
- `modules/*.ts` 管理 API（按业务域分文件）。
- Axios 统一实例（token 注入、错误处理、刷新机制）。
- Zustand 管理全局状态（auth、通知未读数、UI 偏好等）。

## 后台页面实现蓝图（逐页）

### 1) 认证与入口页面
- 登录页：账号密码登录、记住登录、登录异常提示；预留第三方登录按钮（占位态）。
- 忘记密码页（可选首期）：短信/邮箱找回占位，先支持管理员重置流程跳转。
- 个人中心页：基础资料编辑、修改密码、退出登录。
- 复用组件：`AuthCard`、`LoginForm`、`PasswordStrengthField`。
- 核心接口：`POST /api/v1/auth/login`、`POST /api/v1/auth/logout`、`GET /api/v1/auth/me`、`PATCH /api/v1/auth/profile`。

### 2) 用户与权限管理页面
- 用户列表页：分页、搜索（手机号/昵称/状态）、启停用、重置密码、分配角色。
- 用户详情抽屉：基础信息、角色、最近操作、积分概览。
- 角色管理页：角色 CRUD、角色绑定权限（树形勾选）。
- 权限管理页：权限树（menu/api/button），支持按模块筛选与批量授权。
- 菜单管理页（可选）：菜单树配置、路由路径、可见性控制。
- 复用组件：`DataTable`、`StatusBadge`、`AssignRoleDialog`、`PermissionTreeDialog`。
- 核心接口：`/users`、`/roles`、`/permissions`、`/menus`（均为 `/api/v1` 前缀 RESTful 资源）。
- 权限点：`user.read/user.update/user.assignRole`、`role.manage`、`permission.manage`。

### 3) 通知中心页面
- 通知列表页：分页、按已读/类型筛选、批量已读、批量删除。
- 通知详情弹窗：查看正文、跳转业务页（如工单详情）。
- 顶栏通知面板：未读数、最近通知、实时刷新（WebSocket）。
- 复用组件：`NotificationList`、`UnreadCountBadge`、`RealtimeIndicator`。
- 核心接口：`GET /api/v1/notifications`、`PATCH /api/v1/notifications/:id/read`、`PATCH /api/v1/notifications/read-all`。
- 实时事件：`notifications:created`、`notifications:changed`。

### 4) 会员积分页面
- 会员等级页：当前等级、积分区间、升级差值、权益展示。
- 积分账本页：积分收支记录、来源类型筛选、时间筛选、导出（可选）。
- 积分规则页（管理员）：等级阈值、积分规则配置、生效时间管理。
- 手工调分弹窗（管理员）：加减分、原因、业务关联单号。
- 复用组件：`PointsSummaryCard`、`PointsLedgerTable`、`AdjustPointsDialog`。
- 核心接口：`/memberships/account`、`/memberships/ledger`、`/memberships/rules`。
- 权限点：`membership.read`、`membership.rule.manage`、`membership.points.adjust`。

### 5) 教材库页面
- 教材列表页：关键词搜索、分类筛选、标签筛选、状态筛选、排序。
- 教材新建/编辑页：基础信息、封面上传、markdown 描述、标签与分类绑定。
- 教材详情页：基础信息、分集列表、统计信息（浏览/学习次数可后补）。
- 分集管理页：分集 CRUD、排序、发布状态、内容编辑。
- 批量导入页（可选）：文件拖拽上传、解析结果预览、错误项下载。
- 复用组件：`TextbookForm`、`EpisodeTable`、`TagSelector`、`CategoryTreeSelect`、`UploadDropzone`、`MarkdownEditor`。
- 核心接口：`/textbooks`、`/textbooks/:id/episodes`、`/tags`、`/categories/tree`、`/files/upload`。
- 权限点：`textbook.read`、`textbook.create`、`textbook.update`、`textbook.delete`、`episode.manage`。

### 6) 分类库页面（三层树）
- 分类树管理页：树结构展示、节点新增/编辑/删除、同级排序。
- 分类详情面板：层级、路径、关联教材数量。
- 分类迁移弹窗（可选）：节点迁移父级（校验最大三层）。
- 复用组件：`CategoryTree`、`CategoryNodeFormDialog`、`SortHandleList`。
- 核心接口：`GET /api/v1/categories/tree`、`POST /api/v1/categories`、`PATCH /api/v1/categories/:id`、`DELETE /api/v1/categories/:id`。
- 权限点：`category.read`、`category.manage`。

### 7) 标签库页面
- 标签列表页：分页、搜索、创建、编辑、删除、查看关联教材数。
- 标签合并弹窗（可选）：将旧标签迁移到新标签并删除旧标签。
- 复用组件：`TagTable`、`TagFormDialog`。
- 核心接口：`/tags`。
- 权限点：`tag.read`、`tag.manage`。

### 8) 工单管理页面
- 工单列表页：按状态/优先级/处理人筛选，支持批量分配与批量状态更新。
- 工单详情页：工单内容、处理记录、回复区、附件区、操作日志时间线。
- 工单处理台：待处理工单聚合视图（运营角色）。
- 工单统计页（可选）：处理时效、关闭率、超时率。
- 复用组件：`TicketStatusBadge`、`TicketTimeline`、`TicketReplyEditor`、`AssignTicketDialog`。
- 核心接口：`/tickets`、`/tickets/:id/replies`、`/tickets/:id/logs`。
- 权限点：`ticket.read`、`ticket.create`、`ticket.assign`、`ticket.process`、`ticket.close`。

### 9) 文件与上传页面
- 文件中心页：按业务类型（教材/头像/工单）筛选，查看上传状态与引用关系。
- 上传任务页（可选）：上传队列进度、失败重试、取消任务。
- 复用组件：`FileTable`、`UploadTaskPanel`、`FilePreviewDialog`。
- 核心接口：`/files`、`/files/upload`、`/files/:id`。
- 权限点：`file.read`、`file.upload`、`file.delete`。

### 10) 日志与审计页面
- 审计日志页：按操作人、资源类型、操作类型、时间范围筛选。
- 系统日志页（可选首期只读）：错误级别筛选、requestId 检索。
- 复用组件：`AuditLogTable`、`RequestTraceDrawer`。
- 核心接口：`/audit-logs`、`/system-logs`。
- 权限点：`audit.read`、`systemLog.read`。

### 11) 系统配置页面
- 配置总览页：积分规则、上传限制、通知模板、开关项。
- 字典配置页（可选）：工单类型、通知类型、标签颜色等枚举项管理。
- 复用组件：`ConfigForm`、`FeatureSwitchCard`。
- 核心接口：`/system-configs`、`/dictionaries`。
- 权限点：`config.read`、`config.manage`。

### 12) 页面级通用交互规范
- 列表页统一：`FilterBar + DataTable + Pagination + BatchActions`。
- 新增编辑统一：`FormDialog`（小表单）或独立路由页（复杂表单）。
- 状态处理统一：骨架屏、空态、错误态、无权限态（403）。
- 删除操作统一：二次确认 + 风险提示（关联数据数量）。
- 反馈统一：成功 toast、失败 message、字段级校验错误回显。

## 数据模型草案（核心）
- 用户与权限：`User/Role/Permission/RoleAssignment`。
- 通知：`Notification`（read/type/targetUserId）。
- 会员积分：`MembershipAccount/PointsLedger/LevelRule`。
- 教材域：`Textbook/TextbookEpisode/Tag/TextbookTagRelation`。
- 分类树：`Category`（三层约束）。
- 工单：`Ticket/TicketReply/TicketLog`。
- 文件：`FileAsset`（上传元数据）。

## 开发顺序（降低耦合）
1. 搭建 monorepo 与基础工程（lint、env、prisma、axios、layout、路由懒加载）。
2. 完成多环境配置、Prisma 迁移/seed、日志与 requestId、Redis 基线接入。
3. 落地后端 DDD 骨架与 shared 包（通用 DTO、基类 service、guard、decorator、异常规范）。
4. 完成 auth + rbac + 用户管理（包含 menu/api/button 权限模型与 `/me` 权限返回）。
5. 实现前端权限守卫体系（动态路由、按钮授权、403 页面）。
6. 实现分类库与标签库（为教材库提供基础维度）。
7. 实现教材库与分集管理（接入上传、markdown、搜索筛选）。
8. 实现会员积分与等级规则（并发一致性保障）。
9. 实现工单系统（含状态机与超时任务）。
10. 实现通知 REST + WebSocket 推送闭环（含未读缓存）。
11. 接入任务调度/队列，补齐文件清理、通知归档、积分对账任务。
12. 最后补齐审计日志校验、性能基线压测与 E2E 回归。

## 分阶段推进（不按天数）

### 阶段 0：工程与基础设施底座
- 范围：monorepo、前后端初始化、环境配置、Prisma 迁移/seed、Redis、日志与 requestId、API 版本前缀。
- 关键产出：项目可启动、数据库可迁移、默认账号与权限树可初始化、基础观测可用。
- 完成标准：`backend/frontend` 可稳定运行，具备最小可运维能力。

### 阶段 1：鉴权与权限闭环
- 范围：登录注册、JWT/refresh、RBAC（menu/api/button）、`/me` 权限返回、前端 Route/Component Guard、403 页面。
- 关键产出：后台权限体系闭环（后端控制 + 前端展示与交互控制）。
- 完成标准：不同角色登录后看到不同菜单、按钮与接口权限严格一致。

### 阶段 2：核心内容域（分类 + 教材）
- 范围：三级分类树、标签库、教材与分集 CRUD、上传与 markdown、筛选搜索。
- 关键产出：可运营的教材管理后台，支持分类与标签组织能力。
- 完成标准：教材可按分类/标签完整管理，上传流程与状态流转可追踪。

### 阶段 3：运营域（会员积分 + 工单）
- 范围：积分账本、等级规则、并发一致性保障；工单状态机、回复、日志、超时处理。
- 关键产出：会员体系与服务流程管理能力。
- 完成标准：积分计算与等级变更正确，工单流转可审计可追溯。

### 阶段 4：通知与实时能力
- 范围：通知 REST、未读统计缓存、WebSocket 鉴权接入与实时推送、前端实时刷新。
- 关键产出：消息中心与实时联动能力。
- 完成标准：通知创建后可实时触达目标用户，未读数与列表状态一致。

### 阶段 5：任务调度与稳定性收敛
- 范围：Schedule/BullMQ 任务（文件清理、通知归档、积分对账、工单超时）、性能基线优化、错误码收敛、E2E 回归。
- 关键产出：系统从“能用”提升到“可持续运行”。
- 完成标准：关键任务自动化稳定运行，核心链路通过回归测试并满足性能基线。

## 验收标准（MVP）
- 能完成登录注册、权限控制与后台用户管理。
- 分类树（三层）与教材/分集/标签 CRUD 全部可用。
- 会员积分可记账并自动映射三级会员。
- 工单可创建、处理、回复、关闭。
- 通知支持列表管理与 WebSocket 实时推送。
- 前端具备可复用后台组件体系（table/dialog/form/upload/markdown）与懒加载骨架。
- 具备基础生产能力：多环境配置、迁移/seed、Redis 缓存、日志追踪、定时任务与错误码体系。