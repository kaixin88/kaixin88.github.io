#!/usr/bin/env bash
# 一键部署 AstroPaper 到 Gitee Pages（个人主页仓库 kuaila -> https://kuaila.gitee.io/）
# 用法： GITEE_TOKEN=xxxx bash scripts/deploy-gitee.sh
set -e

cd "$(dirname "$0")/.." || exit 1

GITEE_USER="${GITEE_USER:-kuaila}"
GITEE_TOKEN="${GITEE_TOKEN:?请通过环境变量 GITEE_TOKEN 传入 Gitee 令牌}"
REPO="kuaila"
REMOTE="https://${GITEE_USER}:${GITEE_TOKEN}@gitee.com/${GITEE_USER}/${REPO}.git"

echo "==> 1/4 构建静态产物"
npm run build

echo "==> 2/4 初始化 dist 为独立 git 仓库并推送"
cd dist
rm -rf .git
git init -q -b master
git config user.email "deploy@local"
git config user.name "deploy-bot"
git remote add origin "$REMOTE"
git add -A
git commit -q -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push -f origin master
cd ..

echo "==> 3/4 开启 Gitee Pages（如已开启则忽略报错）"
curl -s -X POST "https://gitee.com/api/v5/repos/${GITEE_USER}/${REPO}/pages" \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"${GITEE_TOKEN}\",\"branch\":\"master\",\"build_directory\":\"/\",\"https\":true}" \
  | head -c 300
echo ""

echo "==> 4/4 触发 Pages 重新构建"
curl -s -X POST "https://gitee.com/api/v5/repos/${GITEE_USER}/${REPO}/pages/builds" \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"${GITEE_TOKEN}\"}" \
  | head -c 300
echo ""

echo "==> 完成。稍等 1-2 分钟访问：https://${GITEE_USER}.gitee.io/"
