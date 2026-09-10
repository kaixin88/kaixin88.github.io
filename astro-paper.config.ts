import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://kaixin88.github.io/",
    title: "小站",
    description: "菜谱 · 旅游 · 感想 · 技术 的私人笔记",
    author: "kuaile",
    profile: "https://kaixin88.github.io/",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: false,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  // 页脚社交区：暂不需要，留空数组即可（后续想加图标，往这里加一项）
  socials: [],
  shareLinks: [],
});
