# 🛠️ 命令管理器 (Command Manager)

一个功能丰富的命令备忘小工具，采用纯前端 HTML + CSS + JavaScript 实现，所有数据存储在浏览器本地。

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

## 快速开始

直接用浏览器打开 `index.html` 即可使用，无需安装任何依赖。

所有数据自动保存在浏览器 `localStorage` 中，关闭页面后数据不会丢失。

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
6. 打开页面，点击 `🔐 登录管理` → 创建管理员账号 → 登录后点击统计栏的 `未连接` 状态（或顶部 `☁️ 同步` 按钮）
7. 粘贴 Token → 点击 **测试连接** → **保存并同步**

### 使用说明

- **访客模式**（默认）：打开页面即可浏览、搜索、复制、导出，无需任何配置
- **管理员模式**：点击 `🔐 登录管理` → 输入用户名和密码 → 进入管理界面
- **增删改命令**：自动推送到 GitHub（状态栏显示 `同步中…` → `已同步`）
- **页面加载**：管理员自动从 GitHub API 拉取，访客从 CDN 加载
- **手动同步**：点击顶部 `☁️ 同步` 按钮或状态栏的 `⟳` 图标
- **每个浏览器**需要单独创建一次管理员账号 + 配置一次 Token

### 工作原理

```
访客: 浏览器 → raw.githubusercontent.com CDN（只读，快，无认证）
管理员: 浏览器 → localStorage → GitHub API（读写，需要 Token）

                    raw CDN ← GitHub仓库 data/data.json → GitHub API
                       ↑                                      ↓
              访客自动读取                               管理员写入/读取
```

## 分类结构

| 主分类 | 子分类 |
|--------|--------|
| 🐧 Linux | 系统管理、文件操作、网络、进程、用户管理、防火墙 |
| 🪟 Windows | 系统管理、网络、进程、用户管理 |
| 🔴 渗透测试 | Nmap、SQLMap、Metasploit、密码破解、Web测试、无线测试 |
| 💻 开发工具 | Git、Docker、NPM/Node、Python、数据库、构建工具 |

分类和子分类可自由扩展，新增的子分类会自动保存。
