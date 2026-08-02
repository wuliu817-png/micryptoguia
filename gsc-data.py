#!/usr/bin/env python3
"""micryptoguia.com GSC 数据拉取脚本"""
import json, time, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timedelta

# --- 配置 ---
KEY_FILE = '/Users/yangwenlin/Downloads/clean-skill-503811-c4-0131c897d24a.json'
SITE = 'https://micryptoguia.com/'
DAYS = 28  # 拉取最近多少天

# --- 获取 token ---
import jwt
with open(KEY_FILE) as f:
    key = json.load(f)

now = int(time.time())
payload = {
    'iss': key['client_email'],
    'scope': 'https://www.googleapis.com/auth/webmasters',
    'aud': key['token_uri'],
    'exp': now + 3600,
    'iat': now,
}
token = jwt.encode(payload, key['private_key'], algorithm='RS256')
data = urllib.parse.urlencode({
    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion': token,
}).encode()
req = urllib.request.Request(key['token_uri'], data=data)
resp = urllib.request.urlopen(req, timeout=10)
access_token = json.loads(resp.read())['access_token']

# --- 搜索分析 ---
end = datetime.now().strftime('%Y-%m-%d')
start = (datetime.now() - timedelta(days=DAYS)).strftime('%Y-%m-%d')

print(f'📊 micryptoguia.com 搜索数据 ({start} ~ {end})')
print('=' * 70)

# 按查询词
body = json.dumps({
    'startDate': start, 'endDate': end,
    'dimensions': ['query'],
    'rowLimit': 25,
}).encode()
req = urllib.request.Request(
    f'https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE)}/searchAnalytics/query',
    data=body, method='POST'
)
req.add_header('Authorization', f'Bearer {access_token}')
req.add_header('Content-Type', 'application/json')

try:
    resp = urllib.request.urlopen(req, timeout=15)
    result = json.loads(resp.read())
    rows = result.get('rows', [])
    if rows:
        print(f'\n🔤 热门查询词：')
        for r in rows:
            print(f"  {r['keys'][0]:<45} 点击:{r.get('clicks',0):<5} 展示:{r.get('impressions',0):<7} 排名:{r.get('position',0):.1f}")
    else:
        print('\n暂无数据')
except urllib.error.HTTPError as e:
    print(f'错误: {e.code} - {e.read().decode()}')

# 按国家
body2 = json.dumps({
    'startDate': start, 'endDate': end,
    'dimensions': ['country'],
    'rowLimit': 25,
}).encode()
req2 = urllib.request.Request(
    f'https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE)}/searchAnalytics/query',
    data=body2, method='POST'
)
req2.add_header('Authorization', f'Bearer {access_token}')
req2.add_header('Content-Type', 'application/json')

try:
    resp2 = urllib.request.urlopen(req2, timeout=15)
    result2 = json.loads(resp2.read())
    rows2 = result2.get('rows', [])
    if rows2:
        print(f'\n🌍 按国家/地区：')
        for r in rows2:
            print(f"  {r['keys'][0]:<20} 点击:{r.get('clicks',0):<5} 展示:{r.get('impressions',0):<7} 排名:{r.get('position',0):.1f}")
except urllib.error.HTTPError as e:
    print(f'错误: {e.code} - {e.read().decode()}')
