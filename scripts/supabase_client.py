"""
Supabase REST API helper for Python scripts.
Uses direct HTTP calls — no heavy SDK dependency.
Reads credentials from ../.env.local
"""

import os
import requests
from dotenv import load_dotenv

# Load .env.local from project root
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    )

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def select(table: str, params: dict = None) -> list:
    """SELECT rows from a table. params are query string filters."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.get(url, headers=HEADERS, params=params or {})
    resp.raise_for_status()
    return resp.json()


def insert(table: str, rows: list[dict], upsert: bool = False) -> list:
    """INSERT (or upsert) rows into a table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {**HEADERS}
    if upsert:
        headers["Prefer"] = "return=representation,resolution=merge-duplicates"
    resp = requests.post(url, headers=headers, json=rows)
    resp.raise_for_status()
    return resp.json()


def update(table: str, match: dict, data: dict) -> list:
    """UPDATE rows matching filters."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    params = {f"{k}": f"eq.{v}" for k, v in match.items()}
    resp = requests.patch(url, headers=HEADERS, params=params, json=data)
    resp.raise_for_status()
    return resp.json()


def delete(table: str, match: dict) -> None:
    """DELETE rows matching filters."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    params = {f"{k}": f"eq.{v}" for k, v in match.items()}
    resp = requests.delete(url, headers=HEADERS, params=params)
    resp.raise_for_status()


def rpc(function_name: str, params: dict = None) -> any:
    """Call a Supabase RPC function."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    resp = requests.post(url, headers=HEADERS, json=params or {})
    resp.raise_for_status()
    return resp.json()


def run_sql(sql: str) -> None:
    """Execute raw SQL via the Supabase SQL endpoint (requires service role key)."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    # Note: This requires a custom function or use the Supabase dashboard SQL editor
    print(f"[SQL] Run this in Supabase SQL Editor:\n{sql}\n")
