# 🛠️ 命令管理器 (Command Manager)

一个功能丰富的命令备忘小工具。项目分为本机管理版和 GitHub Pages 公开只读版，两者共享公开的命令数据，但管理凭据和 GitHub Token 不会部署到公开站点。

## 版本划分

| 版本 | 入口 | 用途 |
|------|------|------|
| 本机管理版 | `admin/index.html` | 添加、编辑、删除、导入和同步命令 |
| 公开只读版 | 仓库根目录 `index.html` | 搜索、筛选、复制和导出公开命令 |

GitHub Pages 继续按现有设置从 `main / root` 发布。即使有人直接访问公开的 `/admin/` 路径，管理版也会停止初始化，不读取数据、不连接 GitHub API，也不显示 Token 输入界面。

## 功能特性

- **命令管理** — 增删改查常用命令，支持主分类 + 子分类 + 标签
- **收藏系统** — ⭐ 星标收藏常用命令，一键筛选
- **模糊搜索** — 支持多词空格分隔 + 字符级模糊匹配
- **复制追踪** — 自动记录每条命令的复制次数，按使用频率排序
- **导出导入** — JSON / Markdown / CSV 三种格式导出，支持 JSON 导入
- **批量操作** — 多选命令后批量删除或导出
- **撤销删除** — 删除后 5 秒内可一键恢复
- **键盘快捷键** — 按 `?` 查看所有快捷键
- **分页浏览** — 每页 30 条，平滑翻页
- **暗色主题** — 护眼深色 UI，自定义滚动条
- **☁️ 云同步** — 通过 GitHub API 多设备数据同步

## 本机管理

在仓库根目录启动本地服务器：

```bash
python3 -m http.server 8787
```

然后访问：

```text
http://127.0.0.1:8787/admin/
```

不要直接使用 `file://` 打开管理页。固定使用同一个地址和端口，可让浏览器继续使用原有的本地管理员账号和 Token 配置。

所有管理数据自动保存在该本地来源的 `localStorage` 中，关闭页面后不会丢失。

## 公开只读站点

公开站点继续使用仓库现有的 **Deploy from a branch → main → / (root)** 设置，不需要修改 GitHub Pages 配置。公开地址保持为：

```text
https://ironmole666.github.io/linux-command/
```

## 数据备份

点击顶部 **JSON / MD / CSV** 按钮可导出数据，**导入**按钮可恢复之前导出的 JSON 文件。

## ☁️ 云同步（可选）

数据默认存在当前浏览器 `localStorage` 中，如需在多个电脑/浏览器间共享数据，可使用 GitHub 云同步：

### 首次配置

1. 打开 GitHub [Fine-grained Token 页面](https://github.com/settings/tokens?type=beta)
2. 点击 **Generate new token** → **Fine-grained token**
3. 填写 **Token name**（如 `命令管理器`），**Repository access** 选 `Only select repositories` → 选中 `ironmole666/linux-command`
4. **Permissions** 展开 **Contents** → 选 **Read and write**
5. 生成并复制 Token
6. 打开本机管理页 `http://127.0.0.1:8787/admin/`，点击 `🔐 登录管理` → 创建本地管理员账号 → 登录后点击统计栏的 `未连接` 状态（或顶部 `☁️ 同步` 按钮）
7. 粘贴 Token → 点击 **测试连接** → **保存并同步**

### 使用说明

- **公开站点**：只能浏览、搜索、复制和导出，没有登录入口和 GitHub API 写入代码
- **本机管理版**：点击 `🔐 登录管理` → 输入用户名和密码 → 进入管理界面
- **增删改命令**：自动推送到 GitHub（状态栏显示 `同步中…` → `已同步`）
- **页面加载**：本机管理版从 GitHub API 拉取；公开站点读取同一仓库中的只读 JSON
- **手动同步**：点击顶部 `☁️ 同步` 按钮或状态栏的 `⟳` 图标
- **每台管理设备**需要创建本地管理员账号并配置一次 Token；管理员凭据不再上传到公开仓库

### 工作原理

```
访客: GitHub Pages → data/data.json（只读，无认证）
管理员: localhost → localStorage → GitHub API（读写，需要 Token）

              GitHub Pages ← GitHub仓库 data/data.json
                                      ↑
                           本机管理员写入/读取
```

## 分类结构

| 主分类 | 子分类 |
|--------|--------|
| 🐧 Linux | 系统管理、文件操作、网络、进程、用户管理、防火墙 |
| 🪟 Windows | 系统管理、网络、进程、用户管理 |
| 🔴 渗透测试 | Nmap、SQLMap、Metasploit、密码破解、Web测试、无线测试 |
| 💻 开发工具 | Git、Docker、NPM/Node、Python、数据库、构建工具 |

分类和子分类可自由扩展，新增的子分类会自动保存。

## ⚠️ 安全说明

本项目没有后端服务器。管理认证仅用于保护本机管理界面，真正的云端写入权限仍由 GitHub Token 决定：

| 你能在 F12 → Application → Local Storage 看到 | 实际风险 |
|------|----------|
| `admin_creds` = `{ username, algorithm, salt, passwordHash }` | 仅保存在 localhost；用于防止本机误操作，不上传仓库 |
| `github_token` | 仅保存在 localhost；持有 Token 可读写你的 GitHub 仓库 `data/data.json` |
| `commandManagerData` | 全部命令数据，明文可见 |

**这意味着：**
- 任何人若能使用你的已解锁电脑并访问该 localhost 页面，仍可能通过 DevTools 绕过本地登录
- 这个工具的设计目标是 **防误操作** 而非 **防攻击**
- 真正关键的防线是你的 **GitHub Token**——持有 Token 才能修改云端数据
- Token 应限制为此仓库的 Contents read/write 权限，设置有效期并定期轮换
- `data/data.json` 只允许包含准备公开分享的命令数据，不要保存密码、Token、真实内网信息或其他敏感内容
