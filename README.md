# 工控网关证书下发管理平台

工业控制系统边缘网关设备通信证书全生命周期管理平台，确保设备接入平台的安全性和可追溯性。

## ✨ 功能特性

### 🔐 证书管理
- **证书申请**：为边缘网关设备申请通信证书，自动生成RSA密钥对
- **证书吊销**：支持手动吊销证书，记录吊销原因
- **状态检查**：实时检查证书有效期、吊销状态
- **过期提醒**：证书到期前自动提醒，支持自定义提醒阈值

### 📡 设备管理
- **网关注册**：支持新网关设备注册，绑定厂区和生产线
- **状态监控**：实时监控网关在线/离线状态
- **吊销拦截**：已吊销设备禁止连接平台，确保安全
- **信息维护**：网关设备信息查询和管理

### 🏭 厂区管理
- **厂区配置**：支持多厂区管理，配置厂区基本信息
- **生产线管理**：每个厂区下配置多条生产线
- **层级关系**：清晰的厂区→生产线→网关层级结构

### 📊 数据追溯
- **历史数据**：永久保存网关采集的历史数据，支持多维度查询
- **数据统计**：按数据类型自动统计平均值、数量
- **审计日志**：记录所有操作日志，支持审计追踪
- **吊销后追溯**：设备吊销后，历史数据仍可查询

### ⚙️ 系统设置
- **过期阈值**：自定义证书过期提醒天数
- **有效期配置**：设置新申请证书的默认有效期
- **参数维护**：系统核心参数配置管理

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的组件开发
- **Vite** - 快速的构建工具
- **TailwindCSS 3** - 原子化CSS框架
- **Zustand** - 轻量级状态管理
- **React Router v6** - 路由管理
- **Lucide React** - 图标库

### 后端
- **Express 4** + **TypeScript** - Node.js Web框架
- **better-sqlite3** - 轻量级SQLite数据库
- **node-cron** - 定时任务调度
- **Node.js Crypto** - 证书加密生成

## 📁 项目结构

```
├── api/                         # 后端代码
│   ├── controllers/            # 控制器层（8个控制器）
│   ├── services/               # 业务服务层（7个核心服务）
│   ├── routes/                 # API路由定义
│   ├── db/                     # 数据库连接和初始化
│   ├── utils/                  # 工具函数（证书生成、参数清理）
│   ├── cron/                   # 定时任务
│   ├── app.ts                  # Express应用配置
│   └── server.ts               # 服务器入口
├── src/                         # 前端代码
│   ├── pages/                  # 页面组件（9个页面）
│   ├── components/             # 公共组件
│   ├── store/                  # Zustand状态管理
│   ├── api/                    # API客户端和接口定义
│   ├── App.tsx                 # 应用入口和路由配置
│   ├── main.tsx                # React渲染入口
│   └── index.css               # 全局样式
├── shared/                      # 前后端共享
│   └── types.ts                # TypeScript类型定义
├── migrations/                  # 数据库迁移
│   └── 001_initial_schema.sql  # 初始表结构DDL
├── .trae/documents/            # 项目文档
│   ├── PRD-工控网关证书下发台.md    # 产品需求文档
│   └── TECH-工控网关证书下发台.md   # 技术架构文档
└── test_params.js              # 测试文件（可删除）
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖
```bash
npm install
```

### 启动开发服务
```bash
npm run dev
```

启动后访问：
- **前端地址**：http://localhost:5173
- **后端地址**：http://localhost:3188（实际运行端口）
- **API代理**：前端 `/api` 自动代理到后端

### 其他命令
```bash
# 类型检查
npm run check

# 前端构建
npm run build

# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev
```

## 📊 预置演示数据

系统启动时自动导入以下演示数据：

| 类型 | 数量 | 说明 |
|------|------|------|
| 厂区 | 2 | 华东一号厂区、华南二号厂区 |
| 生产线 | 4 | SMT贴片线、组装测试线等 |
| 网关设备 | 5 | 包含在线/离线/已吊销三种状态 |
| 采集数据 | 2790+ | 温度、湿度、振动、压力等历史数据 |
| 审计日志 | 多条 | 记录所有预置操作 |

## 🔌 API 接口

### 证书管理
- `GET /api/certificates` - 证书列表（支持筛选）
- `GET /api/certificates/:id` - 证书详情
- `POST /api/certificates` - 申请新证书
- `POST /api/certificates/:id/revoke` - 吊销证书

### 网关管理
- `GET /api/gateways` - 网关列表（支持筛选）
- `GET /api/gateways/all` - 全部网关（无分页）
- `GET /api/gateways/without-certificate` - 未绑定证书的网关
- `POST /api/gateways` - 注册新网关
- `GET /api/gateway/auth?sn=xxx` - 网关连接认证（含吊销拦截）

### 厂区管理
- `GET /api/factories` - 厂区列表
- `POST /api/factories` - 新增厂区
- `GET /api/factories/:id/production-lines` - 厂区下的生产线
- `POST /api/factories/:id/production-lines` - 新增生产线

### 数据追溯
- `GET /api/trace/data` - 历史采集数据（支持筛选）
- `GET /api/trace/audit` - 审计日志（支持筛选）

### 系统设置
- `GET /api/settings` - 获取系统设置
- `PUT /api/settings` - 更新系统设置

### 仪表盘
- `GET /api/dashboard/stats` - 统计概览数据
- `GET /api/dashboard/expiring` - 即将过期证书列表
- `GET /api/dashboard/revoked` - 已吊销设备列表

## ⚡ 核心流程

### 证书申请颁发流程
1. 运维人员在「证书管理」页面点击「申请新证书」
2. 选择网关设备、厂区、生产线
3. 系统自动验证厂区和生产线有效性
4. 生成RSA密钥对和X.509格式证书
5. 保存证书信息并记录审计日志

### 过期提醒流程
1. 每日凌晨00:00定时任务自动扫描所有证书
2. 计算证书剩余有效天数
3. 剩余天数 ≤ 提醒阈值时，标记为即将过期
4. 仪表盘显示即将过期证书列表，红色高亮提醒

### 吊销拦截流程
1. 运维人员吊销证书，填写吊销原因
2. 证书状态更新为 `revoked`
3. 网关设备连接平台时调用认证接口
4. 系统检查证书状态，已吊销则返回 `{ allowed: false }`
5. 网关设备被拦截，无法连接平台
6. **历史采集数据仍可追溯查询**

## 🛡️ 安全特性

| 特性 | 说明 |
|------|------|
| **证书校验** | 网关每次连接都校验证书有效性和吊销状态 |
| **操作审计** | 所有证书/网关/设置操作均记录审计日志 |
| **数据隔离** | 按厂区/生产线划分数据访问范围 |
| **定期轮换** | 支持证书有效期配置，鼓励定期轮换 |
| **吊销白名单** | 支持基于证书序列号的精确拦截 |

## 📝 数据库表结构

共7张核心表：
1. `factories` - 厂区信息
2. `production_lines` - 生产线信息
3. `gateways` - 网关设备信息
4. `certificates` - 证书信息（含密钥对）
5. `collected_data` - 历史采集数据
6. `audit_logs` - 审计日志
7. `system_settings` - 系统设置

完整DDL语句见 [migrations/001_initial_schema.sql](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/migrations/001_initial_schema.sql)

## 📚 相关文档

- [产品需求文档](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/.trae/documents/PRD-工控网关证书下发台.md)
- [技术架构文档](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/.trae/documents/TECH-工控网关证书下发台.md)

## 🔧 配置说明

### 前端代理配置
文件：[vite.config.ts](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/vite.config.ts)
- `/api` → `http://localhost:3188`

### 后端端口配置
文件：[api/server.ts](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/api/server.ts)
- 配置端口：3001
- 实际运行端口：3188（由环境变量控制）

### 定时任务配置
文件：[api/cron/expiryCheck.ts](file:///Users/nancy/Desktop/solo/959/959-01Gen-4/api/cron/expiryCheck.ts)
- 执行时间：每日 00:00（北京时间）
- 任务：检查证书过期状态

## 🧪 测试验证

### 功能测试命令
```bash
# 测试证书吊销拦截
curl "http://localhost:3188/api/gateway/auth?sn=GW20240001"

# 测试带错误参数的查询（已修复）
curl "http://localhost:3188/api/certificates?status=undefined"

# 测试正常查询
curl "http://localhost:3188/api/certificates?status=revoked"
```

### 类型检查
```bash
npm run check
```

## 📄 License

MIT License
