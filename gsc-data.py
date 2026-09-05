#!/usr/bin/env python3
"""micryptoguia.com GSC 数据拉取脚本（对齐 criptotradey 已验证方案）"""
import os, json, warnings
warnings.filterwarnings("ignore")
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7890"
os.environ["https_proxy"] = "http://127.0.0.1:7890"
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from datetime import datetime, timedelta

KEY = "/Users/yangwenlin/Downloads/clean-skill-503811-c4-38eadbb86283.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
creds.refresh(Request())
H = {"Authorization": f"Bearer {creds.token}"}
SITE = "https%3A%2F%2Fmicryptoguia.com%2F"  # URL 编码的 https://micryptoguia.com/

end = datetime.now().strftime('%Y-%m-%d')
start = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')

print(f'📊 micryptoguia.com 搜索数据 ({start} ~ {end})')
print('=' * 70)


def query(dimensions, row_limit=25, label=""):
    body = {"startDate": start, "endDate": end, "dimensions": dimensions, "rowLimit": row_limit}
    r = requests.post(
        f"https://searchconsole.googleapis.com/webmasters/v3/sites/{SITE}/searchAnalytics/query",
        headers=H, json=body, timeout=20)
    if r.status_code != 200:
        print(f'❌ {label} 请求失败 {r.status_code}: {r.text[:300]}')
        return []
    return r.json().get("rows", [])


# 1) 热门查询词
rows = query(["query"], 25, "query")
print('\n🔤 热门查询词：')
for r in rows:
    print(f"  {r['keys'][0]:<45} 点击:{r.get('clicks',0):<5} 展示:{r.get('impressions',0):<7} 排名:{r.get('position',0):.1f}")

# 2) 按国家
rows = query(["country"], 25, "country")
print('\n🌍 按国家/地区：')
for r in rows:
    print(f"  {r['keys'][0]:<20} 点击:{r.get('clicks',0):<5} 展示:{r.get('impressions',0):<7} 排名:{r.get('position',0):.1f}")

# 3) 按页面
rows = query(["page"], 40, "page")
print('\n📄 按页面（点击排序）：')
for r in sorted(rows, key=lambda x: -x.get("clicks", 0))[:20]:
    print(f"  {r.get('clicks',0):>3}点击 {r.get('impressions',0):>5}展示 {r.get('position',0):5.1f}位  {r['keys'][0]}")
