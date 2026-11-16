# 小征在线问答

本项目通过 Cloudflare Workers 同时部署静态网站和 `/api/chat` 接口。

1. 在 Worker 的 Settings → Variables and Secrets 中添加 **Secret**，名称为 `DEEPSEEK_API_KEY`。密钥值只在 Cloudflare 中填写。
2. 构建命令留空，部署命令使用 `npx wrangler deploy`。现有带 `--assets .` 的部署命令也兼容。
3. 部署后刷新网站，打开「小征」并提问。

浏览器只发送问题与站内检索摘录，后端固定调用 DeepSeek 官方的 `deepseek-flash` 模型，关闭深度思考以缩短响应时间，限制回答输出为 500 tokens。

接口按 IP 使用 Cloudflare Rate Limiting，每分钟约 20 次。此限流在各 Cloudflare 节点生效，是基础流量控制，不是全局硬性费用上限。

请求失败时网页使用站内资料回答，稍后提问会重新尝试联网。本地直接双击 HTML 时继续使用离线资料模式。

服务端文件、测试与环境文件通过 `.assetsignore` 排除，不作为静态文件发布。不得把密钥写入前端、Wrangler 配置或 GitHub 仓库。

验证：`node --test tests/worker.test.mjs`；`npx wrangler deploy --dry-run`。本地调试可运行 `npx wrangler dev`，密钥仅通过被 Git 忽略的 `.dev.vars` 配置。
