# AI 算命小程序

基于微信小程序的多模型算命助手，支持 ChatGPT、Gemini、DeepSeek、豆包四种解析方法，可切换真实接口或演示模式。

## 运行方式
1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，导入本项目文件夹。
2. 在 `app.js` 中配置 `globalData.apiBase` 为你的后端域名（需支持 `POST /api/fortune/{model}`），并将 `useMockResponse` 设为 `false` 以启用真实请求。
3. 后端接受 `buildPayload` 生成的 OpenAI 风格 `messages` 与 `model` 字段，按模型分路由到 ChatGPT / Gemini / DeepSeek / 豆包等供应商并返回 `result` 文本。
4. 若仅需体验 UI，可保持 `useMockResponse: true`，前端会随机返回提示文案。

## 目录结构
- `app.json` / `app.js` / `app.wxss`：全局配置与样式。
- `pages/index/`：主页面，包含模型选择、问题输入、结果展示。
- `utils/llmAdapter.js`：模型配置、请求载荷生成与本地 mock。
- `project.config.json`：微信开发者工具项目配置。
