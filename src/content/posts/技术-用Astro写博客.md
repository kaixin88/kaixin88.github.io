---
title: "用 Astro 写博客"
pubDatetime: 2026-09-07T12:00:00+08:00
description: "为什么我选了 Astro + AstroPaper 这套极简静态博客方案。"
tags: ["技术"]
draft: false
---

折腾过 WordPress、Hexo，最后停在 Astro，主要原因是「克制」。

## 为什么是 Astro

- **默认零 JS**：页面是纯静态 HTML，加载极快。
- **内容优先**：写 Markdown 就行，组件按需注水（Islands 架构）。
- **部署简单**：构建出 `dist/` 丢到任意静态托管（Gitee Pages / Vercel / Cloudflare）都能跑。

## 这个站用的主题

[AstroPaper](https://github.com/satnaing/astro-paper)：极简、响应式、支持深色模式，自带搜索和 RSS。

分类用「标签」实现，顶栏直接挂了四个分类入口，点进去就是按时间排序的文章列表。

```bash
# 本地预览
npm run dev
# 构建静态产物到 dist/
npm run build
```

写文章只需要往 `src/content/posts/` 丢一个 `.md`，加好 `tags` 就行。
