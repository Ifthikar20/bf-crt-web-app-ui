#!/usr/bin/env python3
"""
BetterFeel Creator Studio — API Test Script

Auto-logs in and tests every creator API endpoint against production.
Usage: python3 test_creator_api.py
"""

import requests
import json
import sys

BASE = "https://api.betterandbliss.com"
EMAIL = "ali2@gmail.com"
PASSWORD = "Thisiscool@123"

# Colors
G = "\033[92m"  # green
R = "\033[91m"  # red
Y = "\033[93m"  # yellow
B = "\033[94m"  # blue
W = "\033[0m"   # reset

passed = 0
failed = 0
results = []


def test(name, method, path, expected_status=200, data=None, params=None):
    """Run a single API test."""
    global passed, failed
    url = f"{BASE}{path}"
    headers = {"Authorization": f"Token {TOKEN}", "Content-Type": "application/json"}

    try:
        if method == "GET":
            r = requests.get(url, headers=headers, params=params, timeout=15)
        elif method == "POST":
            r = requests.post(url, headers=headers, json=data, timeout=15)
        elif method == "PUT":
            r = requests.put(url, headers=headers, json=data, timeout=15)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, timeout=15)
        else:
            raise ValueError(f"Unknown method: {method}")

        ok = r.status_code == expected_status
        if ok:
            passed += 1
            print(f"  {G}✅ {name}{W}  ({r.status_code})")
        else:
            failed += 1
            detail = ""
            try:
                detail = r.json()
            except:
                detail = r.text[:100]
            print(f"  {R}❌ {name}{W}  (expected {expected_status}, got {r.status_code}: {detail})")

        results.append({"name": name, "ok": ok, "status": r.status_code})
        return r.json() if r.status_code < 400 else None

    except Exception as e:
        failed += 1
        print(f"  {R}❌ {name}{W}  (ERROR: {e})")
        results.append({"name": name, "ok": False, "status": 0})
        return None


# ══════════════════════════════════════════════════════════
# 1. LOGIN
# ══════════════════════════════════════════════════════════
print(f"\n{B}{'═' * 60}{W}")
print(f"{B}  BetterFeel Creator Studio — API Test Suite{W}")
print(f"{B}{'═' * 60}{W}\n")

print(f"{Y}🔐 Step 1: Login{W}")
try:
    login_res = requests.post(f"{BASE}/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    if login_res.status_code == 200:
        TOKEN = login_res.json().get("token")
        user = login_res.json().get("user", {})
        print(f"  {G}✅ Logged in as: {user.get('email', EMAIL)}{W}")
        print(f"  {G}   Token: {TOKEN[:20]}...{W}")
        passed += 1
    else:
        print(f"  {R}❌ Login failed: {login_res.status_code} — {login_res.text[:200]}{W}")
        failed += 1
        sys.exit(1)
except Exception as e:
    print(f"  {R}❌ Login error: {e}{W}")
    sys.exit(1)


# ══════════════════════════════════════════════════════════
# 2. DASHBOARD
# ══════════════════════════════════════════════════════════
print(f"\n{Y}📊 Step 2: Dashboard{W}")
test("GET /api/creator/dashboard/", "GET", "/api/creator/dashboard/")


# ══════════════════════════════════════════════════════════
# 3. CONTENT API
# ══════════════════════════════════════════════════════════
print(f"\n{Y}🎬 Step 3: Content API{W}")

# List content
list_res = test("List all content", "GET", "/api/creator/content/")

# Create draft
draft_res = test("Create draft", "POST", "/api/creator/content/draft/",
                 expected_status=201,
                 data={"title": "API Test — Morning Flow", "content_type": "video"})

content_id = None
if draft_res and draft_res.get("content"):
    content_id = draft_res["content"]["id"]
    print(f"       → Created content ID: {content_id}")

if content_id:
    # Get thumbnail upload URL
    test("Get thumbnail upload URL", "POST", f"/api/creator/content/{content_id}/upload-thumbnail/")

    # Get media upload URL
    test("Get media upload URL", "POST", f"/api/creator/content/{content_id}/upload-media/",
         data={"filename": "test-video.mp4"})

    # Update metadata
    test("Update metadata", "PUT", f"/api/creator/content/{content_id}/update/",
         data={
             "title": "API Test — Morning Flow (Updated)",
             "description": "A relaxing morning yoga routine",
             "tags": "yoga, morning, test",
             "is_premium": False,
         })

    # Get content detail
    test("Get content detail", "GET", f"/api/creator/content/{content_id}/")

    # Publish
    test("Publish content", "POST", f"/api/creator/content/{content_id}/publish/")

    # Unpublish
    test("Unpublish content", "POST", f"/api/creator/content/{content_id}/unpublish/")

    # Archive (cleanup)
    test("Archive content (cleanup)", "DELETE", f"/api/creator/content/{content_id}/archive/")


# ══════════════════════════════════════════════════════════
# 4. EXPERTS API
# ══════════════════════════════════════════════════════════
print(f"\n{Y}👤 Step 4: Experts API{W}")

# List experts
test("List all experts", "GET", "/api/creator/experts/")

# Create expert
exp_res = test("Create expert", "POST", "/api/creator/experts/create/",
               expected_status=201,
               data={"name": "Test Instructor", "title": "Yoga Coach", "bio": "API test expert"})

expert_id = None
if exp_res and exp_res.get("expert"):
    expert_id = exp_res["expert"]["id"]
    print(f"       → Created expert ID: {expert_id}")

if expert_id:
    # Get detail
    test("Get expert detail", "GET", f"/api/creator/experts/{expert_id}/")

    # Update
    test("Update expert", "PUT", f"/api/creator/experts/{expert_id}/update/",
         data={"title": "Senior Yoga Coach", "featured": True})

    # Deactivate (cleanup)
    test("Deactivate expert (cleanup)", "DELETE", f"/api/creator/experts/{expert_id}/deactivate/")


# ══════════════════════════════════════════════════════════
# 5. CATEGORIES API
# ══════════════════════════════════════════════════════════
print(f"\n{Y}📁 Step 5: Categories API{W}")

# List categories
test("List all categories", "GET", "/api/creator/categories/")

# Create category
cat_res = test("Create category", "POST", "/api/creator/categories/create/",
               expected_status=201,
               data={"name": "API Test Category", "description": "For testing", "sort_order": 99})

category_id = None
if cat_res and cat_res.get("category"):
    category_id = cat_res["category"]["id"]
    print(f"       → Created category ID: {category_id}")

if category_id:
    # Update
    test("Update category", "PUT", f"/api/creator/categories/{category_id}/update/",
         data={"description": "Updated by API test"})


# ══════════════════════════════════════════════════════════
# 6. SERIES API
# ══════════════════════════════════════════════════════════
print(f"\n{Y}📚 Step 6: Series API{W}")

# List series
test("List all series", "GET", "/api/creator/series/")

# Create series
series_res = test("Create series", "POST", "/api/creator/series/create/",
                  expected_status=201,
                  data={"title": "API Test Series", "description": "A test program"})

series_id = None
if series_res and series_res.get("series"):
    series_id = series_res["series"]["id"]
    print(f"       → Created series ID: {series_id}")

if series_id:
    # Get detail
    test("Get series detail", "GET", f"/api/creator/series/{series_id}/")

    # Update
    test("Update series", "PUT", f"/api/creator/series/{series_id}/update/",
         data={"description": "Updated by test"})

    # Publish
    test("Publish series", "POST", f"/api/creator/series/{series_id}/publish/")

    # Unpublish
    test("Unpublish series", "POST", f"/api/creator/series/{series_id}/unpublish/")


# ══════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════
total = passed + failed
print(f"\n{B}{'═' * 60}{W}")
print(f"{B}  RESULTS: {passed}/{total} passed, {failed} failed{W}")
print(f"{B}{'═' * 60}{W}")

if failed > 0:
    print(f"\n{R}  Failed tests:{W}")
    for r in results:
        if not r["ok"]:
            print(f"    {R}✗ {r['name']} (status: {r['status']}){W}")
    print()
    sys.exit(1)
else:
    print(f"\n  {G}🎉 All tests passed! Creator Studio API is fully operational.{W}\n")
    sys.exit(0)
