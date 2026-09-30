# 国内 Node 服务部署说明

## 1. 服务器要求

- Node.js 20.9 或更高版本
- 能访问 `10.67.78.118:5432` 的国内服务器或同一内网服务器
- PostgreSQL 用户有创建表和写入 `msun_icuis` 数据库的权限
- 已备案域名和 HTTPS 证书

`10.67.78.118` 是内网地址。若 Node 服务部署在不同云厂商或不同 VPC，必须先打通专线、VPN、VPC 对等连接，或把 PostgreSQL 放到服务所在网络；同时在 PostgreSQL 的 `pg_hba.conf`、云安全组和防火墙中放行 Node 服务服务器 IP。

## 2. 配置和发布

```bash
cd /opt/icuis-survey
npm ci
cp .env.example .env.local
vi .env.local
npm run db:init
npm run build
```

`.env.local` 至少要填入：

```dotenv
POSTGRES_PASSWORD=真实数据库密码
SESSION_SECRET=长度至少32位的随机字符串
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

`npm run db:init` 只会创建表并初始化管理员，不会删除现有答卷。管理员密码会以 bcrypt 哈希写入 `admin_users` 表。

启动服务：

```bash
PORT=3000 npm start
```

生产环境建议用 PM2 或 systemd 守护进程，并让 Nginx/Caddy 负责 HTTPS 和域名转发。反向代理到 `127.0.0.1:3000` 即可。

## 3. 验收

```bash
curl -I https://问卷域名/
curl -i https://问卷域名/api/session
```

浏览器验收：

1. 手机网络打开 `/`，填写并提交一份测试答卷。
2. 打开 `/admin`，使用 `admin / admin123` 登录。
3. 确认答卷详情和 CSV 导出正常。
4. 部署完成后立即修改 `ADMIN_PASSWORD` 并重新执行 `npm run db:init`。

## 4. 数据迁移

旧 Sites 版本的 D1 数据需要先导出为 JSON/CSV，再按 `responses(id, created_at, answers, version)` 字段导入 PostgreSQL。旧表的 `created_at` 是毫秒时间戳，导入 PostgreSQL 时使用 `to_timestamp(created_at / 1000.0)` 转为 `timestamptz`。导入前保留原答卷 UUID 和题目 ID，避免历史答卷无法对应题目。
