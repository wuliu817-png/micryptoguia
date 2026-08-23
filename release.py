#!/usr/bin/env python3
"""
micryptoguia.com 发版辅助脚本

用途：发布流程自动化，两个子命令：

  发版前（本地，git 未 push）：
    python3 release.py sitemap
      扫描全站 HTML，用 git 最后一次提交日期刷新 sitemap.xml 的 <lastmod>，
      并自动收录新增文章、剔除已删除页面。跑完把 sitemap.xml 一起 commit。

  部署后（GitHub Pages 已生效）：
    python3 release.py indexnow
      自动取「本次发版改动的页面」（git diff HEAD~1），提交给 Bing IndexNow。
    python3 release.py indexnow --urls https://... https://...
      手动指定要提交的 URL。
    python3 release.py indexnow --check
      提交前先逐个校验 URL 返回 200（部署没生效就重试）。

依赖：仅 Python 标准库（urllib / subprocess / argparse）。
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime

SITE = "https://micryptoguia.com"
HOST = "micryptoguia.com"
INDEXNOW_KEY = "710cd684341d4290bda7cc5d6d6c3a59"
INDEXNOW_KEY_LOCATION = f"{SITE}/710cd684341d4290bda7cc5d6d6c3a59.txt"
INDEXNOW_ENDPOINT = "https://www.bing.com/indexnow"

# 顶层页面：文件名 -> (changefreq, priority)，与历史 sitemap 一致
TOP_PAGES = {
    "index.html": ("weekly", "1.0"),
    "sitemap.html": ("weekly", "0.7"),
    "sobre.html": ("monthly", "0.6"),
    "privacidad.html": ("yearly", "0.3"),
    "terminos.html": ("yearly", "0.3"),
}


def git_lastmod(relpath):
    """文件最后一次提交日期 YYYY-MM-DD；未提交的新文件回退到文件系统 mtime。"""
    r = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", relpath],
        capture_output=True, text=True,
    )
    out = r.stdout.strip()
    if out:
        return out
    ts = os.path.getmtime(relpath)
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")


def url_for(relpath):
    return f"{SITE}/" if relpath == "index.html" else f"{SITE}/{relpath}"


def collect_pages():
    """返回 [(relpath, changefreq, priority)]，顺序稳定。"""
    pages = []
    for name in ["index.html", "sobre.html", "privacidad.html", "terminos.html", "sitemap.html"]:
        cf, pr = TOP_PAGES[name]
        pages.append((name, cf, pr))
    for name in sorted(os.listdir("articulos")):
        if name.endswith(".html"):
            pages.append((f"articulos/{name}", "monthly", "0.8"))
    return pages


def refresh_sitemap():
    pages = collect_pages()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for relpath, cf, pr in pages:
        lastmod = git_lastmod(relpath)
        loc = url_for(relpath)
        lines += [
            "    <url>",
            f"        <loc>{loc}</loc>",
            f"        <lastmod>{lastmod}</lastmod>",
            f"        <changefreq>{cf}</changefreq>",
            f"        <priority>{pr}</priority>",
            "    </url>",
        ]
    lines.append("</urlset>")
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"✅ sitemap.xml 已刷新：{len(pages)} 个 URL")
    for relpath, cf, pr in pages:
        print(f"   {git_lastmod(relpath)}  {url_for(relpath)}")
    return pages


def changed_urls_from_git():
    """本次发版改动的 HTML 页面（对比上一次提交）。"""
    r = subprocess.run(
        ["git", "diff", "--name-only", "HEAD~1"], capture_output=True, text=True
    )
    urls = []
    for line in r.stdout.splitlines():
        if line.endswith(".html"):
            urls.append(url_for(line))
    return urls


def url_is_200(url, retries=6, delay=3):
    """HEAD 请求校验 200，部署没生效就重试。"""
    for i in range(retries):
        try:
            req = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(req, timeout=10) as r:
                if r.status == 200:
                    return True
        except urllib.error.HTTPError as e:
            if e.code == 200:
                return True
        except Exception:
            pass
        if i < retries - 1:
            print(f"   ⏳ 等待部署生效… ({url})")
            time.sleep(delay)
    return False


def submit_indexnow(urls):
    data = json.dumps({
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": INDEXNOW_KEY_LOCATION,
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT, data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def cmd_sitemap(_args):
    refresh_sitemap()
    print("\n下一步：git add sitemap.xml && git commit && git push")


def cmd_indexnow(args):
    urls = args.urls if args.urls else changed_urls_from_git()
    if not urls:
        print("⚠️  没有检测到改动的 HTML 页面（用 --urls 手动指定）。")
        sys.exit(1)

    print(f"准备提交 {len(urls)} 个 URL 到 IndexNow：")
    for u in urls:
        print(f"   {u}")

    if args.check:
        print("\n校验页面是否已上线（200）…")
        urls = [u for u in urls if url_is_200(u)]
        if not urls:
            print("❌ 所有页面都还没返回 200，请等部署生效后再试。")
            sys.exit(1)
        print(f"✅ {len(urls)} 个页面已上线。")

    status, body = submit_indexnow(urls)
    print(f"\nBing IndexNow 响应：HTTP {status}")
    if body:
        print(body)
    if status in (200, 202):
        print("✅ 已提交，几分钟内 Bing 会重新抓取这些页面。")
    else:
        print("❌ 提交未成功，请检查 key 是否有效、URL 是否已上线。")
        sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="micryptoguia.com 发版辅助脚本")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("sitemap", help="刷新 sitemap.xml 的 lastmod（发版前跑）")

    pidx = sub.add_parser("indexnow", help="把改动页面推给 Bing IndexNow（部署后跑）")
    pidx.add_argument("--urls", nargs="+", help="手动指定 URL（覆盖自动检测）")
    pidx.add_argument("--check", action="store_true", help="提交前校验每个 URL 返回 200")

    args = p.parse_args()
    {"sitemap": cmd_sitemap, "indexnow": cmd_indexnow}[args.cmd](args)


if __name__ == "__main__":
    main()
