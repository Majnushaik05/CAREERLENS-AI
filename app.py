"""CareerLens AI - Streamlit Web Application (Recruiter Workflow v7 Assessment Experience)."""

from __future__ import annotations

import base64
import binascii
import csv
from datetime import datetime, timedelta, time as dt_time
import hashlib
import hmac
import html
import io
import ipaddress
import json
import os
from pathlib import Path
import random
import re
import secrets
import socket
import sqlite3
import textwrap
from typing import Any, Dict, List, Optional
from urllib.parse import quote, urlparse
from zoneinfo import ZoneInfo
import uuid

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import streamlit as st

# ============================================================
# APP CONFIG & CONSTANTS
# ============================================================
API_BASE_URL = os.getenv("API_URL", "https://careerlens-ai-9dx8.onrender.com").rstrip("/")[cite: 1]
ANALYTICS_FILE = "analytics.csv"[cite: 1]
APP_DB_FILE = os.getenv("CAREERLENS_DB", "careerlens.db")[cite: 1]
ADMIN_PIN = os.getenv("ADMIN_PIN", "")[cite: 1]
PUBLIC_APP_URL = os.getenv("PUBLIC_APP_URL", "https://career-lens-ai.streamlit.app").rstrip("/")[cite: 1]

st.set_page_config(
    page_title="CareerLens AI - Smart Career & Recruiter Intelligence",
    page_icon=":material/work:",
    layout="wide",
    initial_sidebar_state="expanded",
)[cite: 1]

# ============================================================
# DATABASE & CACHED CONNECTOR
# ============================================================
@st.cache_resource
def get_db_connection():
    conn = sqlite3.connect(APP_DB_FILE, timeout=30, check_same_thread=False)[cite: 1]
    conn.execute("PRAGMA journal_mode=WAL")[cite: 1]
    conn.execute("PRAGMA foreign_keys=ON")[cite: 1]
    return conn[cite: 1]


def hash_password(password: str, salt: bytes = None) -> str:
    """Uses PBKDF2 with SHA-256 for secure password hashing."""
    if salt is None:[cite: 1]
        salt = os.urandom(16)[cite: 1]
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)[cite: 1]
    return f"{salt.hex()}${hashed.hex()}"[cite: 1]


def password_matches(stored: str, provided: str) -> bool:
    """Validates salted PBKDF2 password hashes with legacy SHA-256 fallback."""
    if not stored:[cite: 1]
        return False[cite: 1]
    if "$" not in stored:[cite: 1]
        return stored == hashlib.sha256(provided.encode("utf-8")).hexdigest()[cite: 1]
    try:
        salt_hex, key_hex = stored.split("$")[cite: 1]
        salt = bytes.fromhex(salt_hex)[cite: 1]
        expected = bytes.fromhex(key_hex)[cite: 1]
        candidate = hashlib.pbkdf2_hmac("sha256", provided.encode("utf-8"), salt, 100000)[cite: 1]
        return hmac.compare_digest(candidate, expected)[cite: 1]
    except Exception:
        return False[cite: 1]


def _init_app_db():
    conn = get_db_connection()[cite: 1]
    with conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )""")[cite: 1]
        conn.execute("""CREATE TABLE IF NOT EXISTS user_state (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )""")[cite: 1]
        conn.execute("""CREATE TABLE IF NOT EXISTS recruiter_state (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )""")[cite: 1]
        conn.execute("""CREATE TABLE IF NOT EXISTS public_assessments (
            token TEXT PRIMARY KEY,
            owner_user_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            assessment_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            used INTEGER NOT NULL DEFAULT 0
        )""")[cite: 1]
        conn.execute("CREATE INDEX IF NOT EXISTS idx_public_assessments_owner ON public_assessments(owner_user_id)")[cite: 1]
        conn.execute("""CREATE TABLE IF NOT EXISTS assessment_submissions (
            token TEXT PRIMARY KEY,
            owner_user_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            assessment_id TEXT,
            candidate_name TEXT,
            candidate_email TEXT,
            role TEXT,
            company TEXT,
            recruiter_name TEXT,
            recruiter_email TEXT,
            score REAL NOT NULL DEFAULT 0,
            total INTEGER NOT NULL DEFAULT 0,
            percentage REAL NOT NULL DEFAULT 0,
            correct INTEGER NOT NULL DEFAULT 0,
            incorrect INTEGER NOT NULL DEFAULT 0,
            unanswered INTEGER NOT NULL DEFAULT 0,
            submitted_at TEXT NOT NULL,
            submission_type TEXT,
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )""")[cite: 1]
        conn.execute("CREATE INDEX IF NOT EXISTS idx_assessment_submissions_owner ON assessment_submissions(owner_user_id)")[cite: 1]
        conn.execute("CREATE INDEX IF NOT EXISTS idx_assessment_submissions_candidate ON assessment_submissions(candidate_id)")[cite: 1]


def _db_user(username: str):
    conn = get_db_connection()[cite: 1]
    return conn.execute(
        "SELECT user_id, username, display_name, password_hash FROM users WHERE lower(username)=lower(?)",
        (username.strip(),),
    ).fetchone()[cite: 1]


def _db_create_user(username: str, display_name: str, password_hash: str):
    user_id = secrets.token_hex(16)[cite: 1]
    conn = get_db_connection()[cite: 1]
    with conn:
        conn.execute(
            "INSERT INTO users(user_id,username,display_name,password_hash,created_at) VALUES(?,?,?,?,?)",
            (user_id, username.strip(), display_name.strip() or username.split("@")[0], password_hash, datetime.now().isoformat(timespec="seconds")),
        )[cite: 1]
    return user_id[cite: 1]


def _db_save_state(user_id: str, state: Dict[str, Any]):
    if not user_id:[cite: 1]
        return[cite: 1]
    payload = json.dumps(state, ensure_ascii=False)[cite: 1]
    conn = get_db_connection()[cite: 1]
    with conn:
        conn.execute(
            "INSERT INTO user_state(user_id,state_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json, updated_at=excluded.updated_at",
            (user_id, payload, datetime.now().isoformat(timespec="seconds")),
        )[cite: 1]


def _db_load_state(user_id: str) -> Dict[str, Any]:
    if not user_id:[cite: 1]
        return {}[cite: 1]
    conn = get_db_connection()[cite: 1]
    row = conn.execute("SELECT state_json FROM user_state WHERE user_id=?", (user_id,)).fetchone()[cite: 1]
    if not row:[cite: 1]
        return {}[cite: 1]
    try:
        return json.loads(row[0]) if isinstance(row[0], str) else {}[cite: 1]
    except (TypeError, ValueError):
        return {}[cite: 1]


def _db_save_recruiter_state(user_id: str, data: Dict[str, Any]):
    if not user_id:[cite: 1]
        return[cite: 1]
    payload = json.dumps(data, ensure_ascii=False)[cite: 1]
    conn = get_db_connection()[cite: 1]
    with conn:
        conn.execute(
            "INSERT INTO recruiter_state(user_id,state_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json, updated_at=excluded.updated_at",
            (user_id, payload, datetime.now().isoformat(timespec="seconds")),
        )[cite: 1]


def _db_load_recruiter_state(user_id: str) -> Dict[str, Any]:
    default = {"campaign": None, "candidates": [], "assessments": [], "submissions": []}[cite: 1]
    if not user_id:[cite: 1]
        return default[cite: 1]
    conn = get_db_connection()[cite: 1]
    row = conn.execute("SELECT state_json FROM recruiter_state WHERE user_id=?", (user_id,)).fetchone()[cite: 1]
    if not row:[cite: 1]
        return default[cite: 1]
    try:
        data = json.loads(row[0])[cite: 1]
        return data if isinstance(data, dict) else default[cite: 1]
    except (TypeError, ValueError):
        return default[cite: 1]


_init_app_db()[cite: 1]

# ============================================================
# SAFE RESPONSE NORMALIZERS & EXTRACTION
# ============================================================
def safe_parse_json(text: str) -> Any:
    if not text:[cite: 1]
        return None[cite: 1]
    try:
        return json.loads(text)[cite: 1]
    except Exception:
        match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)[cite: 1]
        if match:[cite: 1]
            try:
                return json.loads(match.group(0))[cite: 1]
            except Exception:
                pass[cite: 1]
    return None[cite: 1]


def normalize_job_match(raw_res: Any) -> Dict[str, Any]:
    if isinstance(raw_res, str):[cite: 1]
        parsed = safe_parse_json(raw_res)[cite: 1]
        if isinstance(parsed, dict):[cite: 1]
            raw_res = parsed[cite: 1]
    if isinstance(raw_res, dict):[cite: 1]
        overall = raw_res.get("overall", raw_res.get("score", raw_res.get("match_score", 0)))[cite: 1]
        try:
            overall = int(float(overall))[cite: 1]
        except (ValueError, TypeError):
            overall = 0[cite: 1]
        matched = raw_res.get("matched", raw_res.get("matching_skills", []))[cite: 1]
        if isinstance(matched, str):[cite: 1]
            matched = [s.strip() for s in matched.split(",") if s.strip()][cite: 1]
        elif not isinstance(matched, list):[cite: 1]
            matched = [][cite: 1]
        missing = raw_res.get("missing", raw_res.get("missing_skills", []))[cite: 1]
        if isinstance(missing, str):[cite: 1]
            missing = [s.strip() for s in missing.split(",") if s.strip()][cite: 1]
        elif not isinstance(missing, list):[cite: 1]
            missing = [][cite: 1]
        return {
            "overall": max(0, min(100, overall)),
            "matched": matched,
            "missing": missing,
            "recommended_skills": raw_res.get("recommended_skills", missing[:10]) if isinstance(raw_res.get("recommended_skills", missing[:10]), list) else missing[:10],
            "semantic_similarity": float(raw_res.get("semantic_similarity", 0) or 0),
            "summary": str(raw_res.get("summary", "Analysis completed successfully.")),
            "experience_alignment": str(raw_res.get("experience_alignment", "Strong Alignment")),
        }[cite: 1]
    return {
        "overall": 0,
        "matched": [],
        "missing": [],
        "summary": "No valid job-match result was returned.",
        "experience_alignment": "Unavailable",
        "recommended_skills": [],
        "source": "validation",
    }[cite: 1]


EMAIL_RE = re.compile(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+")[cite: 1]


def extract_email_from_text(text: str) -> str:
    for raw in EMAIL_RE.findall(text or ""):[cite: 1]
        email = raw.strip(".,;:()[]{}<>\"").lower()[cite: 1]
        if len(email) <= 254:[cite: 1]
            return email[cite: 1]
    return ""[cite: 1]


def extract_phone_from_text(text: str) -> str:
    match = re.search(r"(?:\+?\d[\d .()\-]{8,}\d)", text or "")[cite: 1]
    return re.sub(r"\s+", " ", match.group(0)).strip() if match else ""[cite: 1]


def _candidate_identity_key(candidate: Dict[str, Any]) -> str:
    email = (candidate.get("email") or "").strip().lower()[cite: 1]
    if email:[cite: 1]
        return f"email:{email}"[cite: 1]
    name = re.sub(r"\W+", "", (candidate.get("name") or "").lower())[cite: 1]
    phone = re.sub(r"\D+", "", (candidate.get("phone") or ""))[cite: 1]
    return f"identity:{name}|{phone}"[cite: 1]


def dedupe_candidates(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    unique = [][cite: 1]
    seen = set()[cite: 1]
    for candidate in candidates:[cite: 1]
        key = _candidate_identity_key(candidate)[cite: 1]
        if key in seen:[cite: 1]
            continue[cite: 1]
        seen.add(key)[cite: 1]
        unique.append(candidate)[cite: 1]
    return unique[cite: 1]


def log_event(event_type: str, username: str, rating: str = "N/A", details: str = ""):
    file_exists = os.path.isfile(ANALYTICS_FILE)[cite: 1]
    try:
        with open(ANALYTICS_FILE, mode="a", newline="", encoding="utf-8") as f:[cite: 1]
            writer = csv.writer(f)[cite: 1]
            if not file_exists:[cite: 1]
                writer.writerow(["Timestamp", "Event", "Username", "Rating", "Details"])[cite: 1]
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                event_type,
                username,
                rating,
                details,
            ])[cite: 1]
    except Exception:
        pass[cite: 1]


# ============================================================
# RESPONSIVE CLEAN BLUE DESIGN SYSTEM (PURE WHITE SIDEBAR, ROLLING TEXT ANIMATIONS)
# ============================================================
st.markdown(
    """
    <style>
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0");
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined" !important;
      font-weight: normal;
      font-style: normal;
      font-size: 1.2rem;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      vertical-align: middle;
    }

    :root {
      --ink: #0f172a;
      --muted: #64748b;
      --line: #e2e8f0;
      --page: #f8fafc;
      --primary-blue: #2563eb;
      --primary-blue-hover: #1d4ed8;
      --primary-blue-soft: #eff6ff;
      --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.05);
      --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.08);
      --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.1);
    }

    * { box-sizing: border-box; }

    html, body, .stApp {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      background: #f8fafc !important;
      color: var(--ink) !important;
      -webkit-font-smoothing: antialiased;
    }

    #MainMenu, footer { visibility: hidden; }
    header[data-testid="stHeader"] { background: transparent !important; }

    .block-container {
      max-width: 1400px !important;
      padding: clamp(12px, 2vw, 24px) clamp(12px, 2.5vw, 32px) clamp(24px, 4vw, 48px) !important;
    }

    p, span, label, div { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, h4 { color: var(--ink) !important; letter-spacing: -0.025em; }

    /* Inputs & Form Controls */
    .stTextInput input, .stTextArea textarea, [data-baseweb="select"] {
      background: #ffffff !important;
      color: var(--ink) !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 10px !important;
      font-size: 0.92rem !important;
      padding: 10px 14px !important;
    }
    .stTextInput input:focus, .stTextArea textarea:focus {
      border-color: var(--primary-blue) !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
    }
    [data-testid="stFileUploader"] {
      background: #ffffff !important;
      border: 1.5px dashed #cbd5e1 !important;
      border-radius: 14px !important;
      padding: 16px !important;
    }

    /* Standard Interactive Buttons */
    .stButton>button, .stDownloadButton>button, .stFormSubmitButton>button {
      border-radius: 10px !important;
      font-weight: 700 !important;
      font-size: 0.88rem !important;
      min-height: 42px !important;
      transition: all 0.18s ease !important;
      box-shadow: var(--shadow-sm) !important;
    }
    .stButton>button[kind="primary"], .stDownloadButton>button[kind="primary"], .stFormSubmitButton>button[kind="primary"] {
      background: var(--primary-blue) !important;
      border: 1px solid var(--primary-blue) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
    }
    .stButton>button[kind="primary"]:hover, .stDownloadButton>button[kind="primary"]:hover, .stFormSubmitButton>button[kind="primary"]:hover {
      background: var(--primary-blue-hover) !important;
      border-color: var(--primary-blue-hover) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.28) !important;
    }
    .stButton>button[kind="secondary"], .stDownloadButton>button[kind="secondary"] {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #334155 !important;
    }
    .stButton>button[kind="secondary"]:hover, .stDownloadButton>button[kind="secondary"]:hover {
      background: #f1f5f9 !important;
      border-color: #94a3b8 !important;
      color: #0f172a !important;
      transform: translateY(-1px) !important;
    }

    /* PURE WHITE CLEAN SIDEBAR */
    [data-testid="stSidebar"], section[data-testid="stSidebar"], section[data-testid="stSidebar"] > div {
      background: #ffffff !important;
      background-color: #ffffff !important;
      border-right: 1px solid #e2e8f0 !important;
      box-shadow: 2px 0 16px rgba(15, 23, 42, 0.03) !important;
    }
    [data-testid="stSidebar"] .sidebar-brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 4px 18px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }
    [data-testid="stSidebar"] .sidebar-user-box {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 18px;
    }
    [data-testid="stSidebar"] .sidebar-section-title {
      font-size: 0.7rem !important;
      font-weight: 800 !important;
      letter-spacing: 0.12em !important;
      color: #64748b !important;
      margin: 18px 4px 8px !important;
      text-transform: uppercase;
    }
    [data-testid="stSidebar"] .stButton>button {
      background: #ffffff !important;
      color: #334155 !important;
      border: 1px solid transparent !important;
      border-radius: 10px !important;
      text-align: left !important;
      justify-content: flex-start !important;
      padding: 9px 12px !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      min-height: 40px !important;
      margin-bottom: 4px !important;
      box-shadow: none !important;
    }
    [data-testid="stSidebar"] .stButton>button:hover {
      background: #f1f5f9 !important;
      color: var(--primary-blue) !important;
      border-color: #e2e8f0 !important;
      transform: translateX(2px) !important;
    }
    [data-testid="stSidebar"] .stButton>button[kind="primary"] {
      background: var(--primary-blue-soft) !important;
      color: var(--primary-blue) !important;
      border: 1px solid #bfdbfe !important;
      font-weight: 800 !important;
      box-shadow: none !important;
    }
    [data-testid="stSidebar"] .stButton>button[kind="primary"] * {
      color: var(--primary-blue) !important;
      -webkit-text-fill-color: var(--primary-blue) !important;
    }

    /* CLEAN MODERN HERO */
    .cl-hero {
      position: relative;
      overflow: hidden;
      padding: 42px 38px 36px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: var(--shadow-sm);
      margin-bottom: 22px;
    }
    .cl-hero-kicker {
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--primary-blue);
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    /* 5-LINE HERO TEXT ROTATOR */
    .cl-hero-title-rotator {
      position: relative;
      height: clamp(3rem, 6.5vw, 4.4rem);
      overflow: hidden;
      margin: 0 0 14px 0;
    }
    .cl-hero-title-rotator .cl-hero-line {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-start;
      opacity: 0;
      transform: translateY(24px);
      animation: clHeroLineRotator 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      line-height: 1.1;
      letter-spacing: -0.04em;
      font-size: clamp(1.8rem, 4.2vw, 3.2rem);
      font-weight: 900;
      color: #0f172a;
      white-space: nowrap;
    }
    .cl-hero-title-rotator .cl-hero-line:nth-child(1) { animation-delay: 0s; }
    .cl-hero-title-rotator .cl-hero-line:nth-child(2) { animation-delay: 3s; }
    .cl-hero-title-rotator .cl-hero-line:nth-child(3) { animation-delay: 6s; }
    .cl-hero-title-rotator .cl-hero-line:nth-child(4) { animation-delay: 9s; }
    .cl-hero-title-rotator .cl-hero-line:nth-child(5) { animation-delay: 12s; }

    @keyframes clHeroLineRotator {
      0% { opacity: 0; transform: translateY(24px); }
      4%, 18% { opacity: 1; transform: translateY(0); }
      22%, 100% { opacity: 0; transform: translateY(-24px); }
    }

    .cl-hero-copy {
      max-width: 760px;
      color: #475569;
      font-size: 1rem;
      line-height: 1.65;
      margin-bottom: 24px;
    }

    /* LANDING PAGE CLEAN CHIPS & BUTTONS */
    .cl-hero-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .cl-hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      background: #ffffff;
      color: #334155;
      font-size: 0.78rem;
      font-weight: 700;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .cl-hero-chip .material-symbols-outlined {
      color: var(--primary-blue);
      font-size: 1.1rem;
    }

    .landing-feature {
      padding: 22px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: var(--shadow-sm);
      min-height: 130px;
    }
    .landing-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
      background: var(--primary-blue-soft);
      color: var(--primary-blue);
      font-weight: 800;
      border: 1px solid #dbeafe;
    }
    .landing-feature-title { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
    .landing-feature-text { margin-top: 4px; color: #64748b; font-size: 0.82rem; line-height: 1.5; }

    .landing-access {
      margin-top: 24px;
      padding: 26px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: var(--shadow-sm);
    }
    .landing-access-title { text-align: center; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
    .landing-access-copy { text-align: center; color: #64748b; font-size: 0.86rem; margin: 4px 0 18px; }
    .landing-divider { height: 2px; border-radius: 99px; background: #e2e8f0; margin: 0 0 20px; }

    /* Cards & Containers */
    .content-box {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 18px;
    }

    /* GATEWAY CARDS & ROLLING PORTAL MESSAGES */
    .gateway-card {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 26px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 330px;
    }
    .gateway-card:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .cl-portal-rotator {
      position: relative;
      height: 2.6rem;
      overflow: hidden;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    .cl-portal-line {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      opacity: 0;
      transform: translateY(16px);
      animation: clPortalLineRotator 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary-blue);
      line-height: 1.4;
    }
    .cl-portal-line:nth-child(1) { animation-delay: 0s; }
    .cl-portal-line:nth-child(2) { animation-delay: 3s; }
    .cl-portal-line:nth-child(3) { animation-delay: 6s; }
    .cl-portal-line:nth-child(4) { animation-delay: 9s; }

    @keyframes clPortalLineRotator {
      0% { opacity: 0; transform: translateY(16px); }
      5%, 22% { opacity: 1; transform: translateY(0); }
      27%, 100% { opacity: 0; transform: translateY(-16px); }
    }

    .header-banner {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 18px 24px;
      margin-bottom: 22px;
      box-shadow: var(--shadow-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-title { font-size: 1.3rem !important; font-weight: 800 !important; color: var(--ink) !important; }
    .header-sub { font-size: 0.82rem !important; color: var(--muted) !important; margin-top: 2px; }

    .role-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-blue-soft) !important;
      color: var(--primary-blue) !important;
      border: 1px solid #bfdbfe;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-sm);
    }
    .kpi-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .tool-box-card {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 20px 16px;
      text-align: center;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 160px;
      margin-bottom: 12px;
      transition: all 0.18s ease;
    }
    .tool-box-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .tool-icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .tool-title { font-size: 0.9rem; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
    .tool-desc { font-size: 0.74rem; color: var(--muted); line-height: 1.45; }

    .tag-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .tag-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
    .tag-purple { background: #faf5ff; color: #7e22ce; border: 1px solid #f3e8ff; }
    .tag-green { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
    .tag-amber { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }

    .cl-app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 20px;
      margin: 0 0 20px;
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
    }
    .cl-app-header-title { font-size: 1.05rem; font-weight: 850; color: #0f172a; }
    .cl-app-header-sub { font-size: 0.74rem; color: #64748b; margin-top: 2px; }

    /* WORKSPACE HEADER ROLLING TICKER */
    .cl-workspace-rotator {
      position: relative;
      height: 1.4rem;
      overflow: hidden;
      margin-top: 4px;
    }
    .cl-workspace-line {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      opacity: 0;
      transform: translateY(12px);
      animation: clWorkspaceLineRotator 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--primary-blue);
    }
    .cl-workspace-line:nth-child(1) { animation-delay: 0s; }
    .cl-workspace-line:nth-child(2) { animation-delay: 3s; }
    .cl-workspace-line:nth-child(3) { animation-delay: 6s; }
    .cl-workspace-line:nth-child(4) { animation-delay: 9s; }

    @keyframes clWorkspaceLineRotator {
      0% { opacity: 0; transform: translateY(12px); }
      5%, 22% { opacity: 1; transform: translateY(0); }
      27%, 100% { opacity: 0; transform: translateY(-12px); }
    }

    .cl-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border-radius: 999px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .cl-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }

    .recruiter-command {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      margin: 0 0 18px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: var(--shadow-sm);
    }
    .recruiter-command-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-blue-soft);
      color: var(--primary-blue);
      border: 1px solid #dbeafe;
    }
    .recruiter-command-title { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
    .recruiter-command-copy { color: #64748b; font-size: 0.75rem; margin-top: 3px; }

    .stProgress > div > div > div {
      background: var(--primary-blue) !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ============================================================
# API CALLS & LOCAL FALLBACKS
# ============================================================
def _extract_resume_text(file) -> str:
    data = file.getvalue()[cite: 1]
    name = (file.name or "").lower()[cite: 1]
    try:
        if name.endswith(".pdf"):[cite: 1]
            from PyPDF2 import PdfReader[cite: 1]
            reader = PdfReader(io.BytesIO(data))[cite: 1]
            return "\n".join((page.extract_text() or "") for page in reader.pages).strip()[cite: 1]
        if name.endswith(".docx"):[cite: 1]
            from docx import Document[cite: 1]
            doc = Document(io.BytesIO(data))[cite: 1]
            return "\n".join(p.text for p in doc.paragraphs).strip()[cite: 1]
        return data.decode("utf-8", errors="ignore").strip()[cite: 1]
    except Exception:
        return ""[cite: 1]


def _resume_sections(text: str) -> Dict[str, str]:
    lines = [re.sub(r"\s+", " ", x).strip() for x in (text or "").splitlines() if x.strip()][cite: 1]
    headings = {
        "summary": ("summary", "professional summary", "profile", "objective"),
        "experience": ("experience", "work experience", "professional experience", "employment"),
        "education": ("education", "academic background"),
        "projects": ("projects", "personal projects", "academic projects"),
        "skills": ("skills", "technical skills", "core skills"),
        "certifications": ("certifications", "certificates", "licenses"),
        "achievements": ("achievements", "accomplishments", "awards"),
    }[cite: 1]
    found = {}[cite: 1]
    for line in lines:[cite: 1]
        clean = re.sub(r"[^a-z ]", "", line.lower()).strip()[cite: 1]
        for key, variants in headings.items():[cite: 1]
            if clean in variants:[cite: 1]
                found[key] = line[cite: 1]
    return found[cite: 1]


def _role_skill_hints(role: str) -> List[str]:
    role_l = (role or "").lower()[cite: 1]
    role_map = {
        "ai": ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "statistics", "sql"],
        "machine learning": ["python", "machine learning", "statistics", "pandas", "numpy", "scikit-learn"],
        "data scientist": ["python", "statistics", "sql", "pandas", "numpy", "machine learning"],
        "data analyst": ["sql", "excel", "power bi", "tableau", "statistics", "data analysis"],
        "software": ["python", "java", "javascript", "git", "sql", "rest api", "testing"],
        "developer": ["programming", "git", "sql", "testing", "api"],
        "devops": ["linux", "docker", "kubernetes", "aws", "git", "ci/cd"],
        "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "linux"],
        "cyber": ["cybersecurity", "linux", "networking", "python", "security"],
        "qa": ["testing", "selenium", "automation", "api testing", "git"],
        "hr": ["recruitment", "employee relations", "communication", "hr analytics"],
        "human resources": ["recruitment", "employee relations", "communication", "hr analytics"],
        "marketing": ["digital marketing", "seo", "content marketing", "analytics", "communication"],
        "sales": ["sales", "negotiation", "communication", "crm", "lead generation"],
        "finance": ["excel", "financial analysis", "accounting", "forecasting", "communication"],
        "account": ["accounting", "excel", "financial analysis", "tax", "audit"],
        "project manager": ["project management", "stakeholder management", "communication", "agile", "risk management"],
        "product manager": ["product management", "roadmapping", "user research", "analytics", "stakeholder management"],
        "teacher": ["lesson planning", "communication", "classroom management", "assessment"],
        "nurse": ["patient care", "clinical", "communication", "documentation"],
        "civil": ["autocad", "structural", "project management", "construction", "safety"],
        "mechanical": ["cad", "solidworks", "mechanical design", "manufacturing", "thermodynamics"],
    }[cite: 1]
    hints = [][cite: 1]
    for key, vals in role_map.items():[cite: 1]
        if key in role_l:[cite: 1]
            hints.extend(vals)[cite: 1]
    return list(dict.fromkeys(hints))[cite: 1]


def _local_resume_analysis(text: str, filename: str, target_role: str = "") -> Dict[str, Any]:
    text = (text or "").strip()[cite: 1]
    lower = text.lower()[cite: 1]
    words = re.findall(r"\b[a-zA-Z]{2,}\b", text)[cite: 1]
    sections = _resume_sections(text)[cite: 1]
    skills = sorted(_skill_set(text))[cite: 1]
    quantified = len(re.findall(r"(?:\b\d+%|\b\d+[+]?(?:\s*years?|\s*users?|\s*clients?)|\b(?:increased|reduced|improved|saved|grew|generated)\b[^.]{0,60}\b\d+)", lower))[cite: 1]
    action_verbs = len(re.findall(r"\b(led|built|developed|designed|implemented|improved|optimized|automated|created|managed|analyzed|delivered|launched|reduced|increased|deployed|tested|trained)\b", lower))[cite: 1]
    bullets = len(re.findall(r"(?:^|\n)\s*[•▪●*-]\s+", text))[cite: 1]
    contact_email = bool(re.search(r"[\w.+'-]+@[\w.-]+\.[A-Za-z]{2,}", text))[cite: 1]
    contact_phone = bool(re.search(r"(?:\+?\d[\d .()\-]{8,}\d)", text))[cite: 1]

    content = min(100, 25 + min(len(words), 700) / 700 * 45 + min(bullets, 18) / 18 * 15 + min(action_verbs, 12) / 12 * 15)[cite: 1]
    section_score = min(100, len(sections) / 7 * 100)[cite: 1]
    skill_score = min(100, len(skills) / 12 * 100)[cite: 1]
    achievement_score = min(100, quantified / 5 * 70 + min(action_verbs, 10) / 10 * 30)[cite: 1]
    contact_score = (50 if contact_email else 0) + (50 if contact_phone else 0)[cite: 1]
    role_hints = _role_skill_hints(target_role)[cite: 1]
    role_match = (len([x for x in role_hints if x in lower]) / len(role_hints) * 100) if role_hints else None[cite: 1]

    weighted = content * .25 + section_score * .20 + skill_score * .20 + achievement_score * .15 + contact_score * .10 + (role_match * .10 if role_match is not None else 0)[cite: 1]
    if role_match is None:[cite: 1]
        weighted += 5[cite: 1]
    resume_score = int(round(max(5, min(98, weighted))))[cite: 1]

    experience_signals = len(re.findall(r"\b(experience|intern|internship|work history|employment|years?)\b", lower))[cite: 1]
    readiness = int(round(max(5, min(97, resume_score * .55 + min(len(skills), 10) * 3 + min(quantified, 5) * 2 + min(experience_signals, 3) * 2))))[cite: 1]
    missing_sections = [x.title() for x in ("summary", "experience", "education", "projects", "skills", "certifications", "achievements") if x not in sections][cite: 1]
    recommendations = [][cite: 1]
    if "experience" in missing_sections: recommendations.append("Add relevant work experience, internships, or substantial project experience.")[cite: 1]
    if "projects" in missing_sections: recommendations.append("Add 2–3 relevant projects with your contribution, tools, and measurable outcomes.")[cite: 1]
    if quantified < 2: recommendations.append("Add measurable results such as %, time saved, revenue, users, accuracy, or scale.")[cite: 1]
    if action_verbs < 4: recommendations.append("Rewrite bullet points with strong action verbs and clear ownership.")[cite: 1]
    if not contact_email or not contact_phone: recommendations.append("Complete the contact section with a professional email and phone number.")[cite: 1]
    if len(skills) < 6: recommendations.append("Add more role-relevant skills supported by projects or experience.")[cite: 1]
    if target_role and role_match is not None and role_match < 50: recommendations.append(f"Tailor the resume toward {target_role} and add evidence for the missing role skills.")[cite: 1]
    if not recommendations: recommendations.append("Maintain this structure and tailor achievements to each target job.")[cite: 1]

    strengths = [][cite: 1]
    if len(skills) >= 6: strengths.append(f"Detected {len(skills)} relevant skills.")[cite: 1]
    if len(sections) >= 5: strengths.append("Good coverage of standard resume sections.")[cite: 1]
    if quantified >= 2: strengths.append("Includes measurable achievement evidence.")[cite: 1]
    if contact_email and contact_phone: strengths.append("Complete contact information detected.")[cite: 1]
    if not strengths: strengths.append("Resume text was extracted successfully; additional evidence can improve the score.")[cite: 1]

    return {
        "name": re.sub(r"[_-]+", " ", Path(filename).stem).strip().title() or "Candidate",
        "email": (re.search(r"[\w.+'-]+@[\w.-]+\.[A-Za-z]{2,}", text).group(0).lower() if re.search(r"[\w.+'-]+@[\w.-]+\.[A-Za-z]{2,}", text) else ""),
        "phone": (re.search(r"(?:\+?\d[\d .()\-]{8,}\d)", text).group(0).strip() if re.search(r"(?:\+?\d[\d .()\-]{8,}\d)", text) else ""),
        "experience": "Experience evidence detected" if experience_signals else "Experience not clearly detected",
        "resume_score": resume_score,
        "readiness": readiness,
        "market_match": None,
        "skills": skills,
        "missing_skills": [x for x in role_hints if x not in lower][:8],
        "strengths": strengths,
        "recommendations": recommendations,
        "score_breakdown": {
            "content_quality": round(content, 1),
            "section_coverage": round(section_score, 1),
            "skills": round(skill_score, 1),
            "achievement_evidence": round(achievement_score, 1),
            "contact_completeness": round(contact_score, 1),
            "target_role_alignment": round(role_match, 1) if role_match is not None else None,
        },
        "extracted_text": text,
        "source": "local-analysis-v4",
        "analysis_version": 4,
    }[cite: 1]

def api_analyze_resume(file, target_role: str = "") -> Dict[str, Any]:
    text = _extract_resume_text(file)[cite: 1]
    local = _local_resume_analysis(text, file.name, target_role)[cite: 1]
    try:
        files = {"file": (file.name, file.getvalue(), file.type or "application/octet-stream")}[cite: 1]
        data_payload = {"target_role": target_role.strip()}[cite: 1]
        res = requests.post(f"{API_BASE_URL}/api/resume/analyze", files=files, data=data_payload, timeout=60)[cite: 1]
        if res.ok and isinstance(res.json(), dict):[cite: 1]
            data = res.json()[cite: 1]
            if int(data.get("analysis_version", 0) or 0) >= 5 and data.get("score_breakdown"):[cite: 1]
                data["extracted_text"] = data.get("extracted_text") or text[cite: 1]
                return data[cite: 1]
    except (requests.RequestException, ValueError, TypeError):
        pass[cite: 1]
    return local[cite: 1]

def _skill_set(text: str) -> set:
    lower = (text or "").lower()[cite: 1]
    catalog = [
        "python", "java", "javascript", "typescript", "c++", "c#", "react", "node.js", "fastapi", "django", "flask",
        "sql", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp", "git", "linux",
        "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "statistics",
        "rest api", "graphql", "redis", "kafka", "system design", "html", "css", "figma", "excel", "power bi", "tableau",
        "cybersecurity", "testing", "selenium", "communication", "leadership", "problem solving", "data analysis",
        "project management", "stakeholder management", "agile", "seo", "digital marketing", "content marketing", "crm",
        "sales", "negotiation", "accounting", "financial analysis", "forecasting", "audit", "tax", "autocad", "solidworks",
        "mechanical design", "manufacturing", "construction", "safety", "recruitment", "employee relations", "hr analytics",
        "lesson planning", "classroom management", "assessment", "patient care", "clinical", "documentation", "networking",
        "automation", "ci/cd", "product management", "roadmapping", "user research", "risk management",
    ][cite: 1]
    return {x for x in catalog if x in lower}[cite: 1]

def api_match_job(resume_text: str, job_description: str) -> Dict[str, Any]:
    if not resume_text.strip() or not job_description.strip():[cite: 1]
        return {
            "overall": 0,
            "matched": [],
            "missing": [],
            "summary": "Both resume and job description are required.",
            "experience_alignment": "Unavailable",
            "source": "validation",
        }[cite: 1]
    try:
        payload = {"resume_text": resume_text, "job_description": job_description}[cite: 1]
        res = requests.post(f"{API_BASE_URL}/api/job/match", json=payload, timeout=30)[cite: 1]
        if res.ok and isinstance(res.json(), dict) and int(res.json().get("analysis_version", 0) or 0) >= 5:[cite: 1]
            return {**normalize_job_match(res.json()), "source": "api-v4"}[cite: 1]
    except (requests.RequestException, ValueError, TypeError):
        pass[cite: 1]
    try:
        matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=8000).fit_transform([resume_text, job_description])[cite: 1]
        similarity = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])[cite: 1]
    except ValueError:
        similarity = 0.0[cite: 1]
    resume_skills = _skill_set(resume_text)[cite: 1]
    job_skills = _skill_set(job_description)[cite: 1]
    matched = sorted(resume_skills & job_skills)[cite: 1]
    missing = sorted(job_skills - resume_skills)[cite: 1]
    skill_score = (len(matched) / len(job_skills) * 100) if job_skills else similarity * 100[cite: 1]
    overall = round((similarity * 60) + (skill_score * 0.40)) if job_skills else round(similarity * 100)[cite: 1]
    return {
        "overall": max(0, min(100, overall)),
        "matched": matched,
        "missing": missing,
        "summary": "Local semantic and skill analysis completed.",
        "experience_alignment": "Strong Alignment" if overall >= 75 else "Moderate Alignment" if overall >= 50 else "Needs Improvement",
        "source": "local-fallback",
    }[cite: 1]


def _safe_public_url(url: str) -> bool:
    try:
        parsed = urlparse(url.strip())[cite: 1]
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:[cite: 1]
            return False[cite: 1]
        addresses = socket.getaddrinfo(parsed.hostname, None)[cite: 1]
        for item in addresses:[cite: 1]
            ip_obj = ipaddress.ip_address(item[4][0])[cite: 1]
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_reserved or ip_obj.is_multicast:[cite: 1]
                return False[cite: 1]
        return True[cite: 1]
    except Exception:
        return False[cite: 1]


def fetch_public_job_url(url: str) -> str:
    if not _safe_public_url(url):[cite: 1]
        raise ValueError("Please enter a valid, safe public HTTP/HTTPS job URL.")[cite: 1]
    response = requests.get(
        url.strip(),
        timeout=10,
        headers={"User-Agent": "CareerLensAI/2.1 Job Safety Analyzer"},
        allow_redirects=False,
    )[cite: 1]
    response.raise_for_status()[cite: 1]
    content_type = response.headers.get("content-type", "").lower()[cite: 1]
    if "text/html" not in content_type and "text/plain" not in content_type:[cite: 1]
        raise ValueError("The supplied link did not return readable HTML/text content.")[cite: 1]
    text = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", response.text, flags=re.I)[cite: 1]
    text = re.sub(r"<[^>]+>", " ", text)[cite: 1]
    return re.sub(r"\s+", " ", text).strip()[:50000][cite: 1]


def api_detect_fraud(job_text: str) -> Dict[str, Any]:
    try:
        payload = {"text": job_text}[cite: 1]
        res = requests.post(f"{API_BASE_URL}/api/job/fraud", json=payload, timeout=30)[cite: 1]
        if res.ok and isinstance(res.json(), dict):[cite: 1]
            return res.json()[cite: 1]
    except (requests.RequestException, ValueError, TypeError):
        pass[cite: 1]
    risk_patterns = {
        "wire transfer": "Requests for wire transfers or direct money movement",
        "registration fee": "Upfront registration or application fees",
        "processing fee": "Upfront processing fees",
        "telegram": "Telegram-only communication",
        "whatsapp": "WhatsApp-only recruitment communication",
        "crypto": "Cryptocurrency payment/request",
        "gift card": "Gift-card payment request",
        "no interview": "No-interview hiring claim",
        "pay to apply": "Payment required to apply",
        "urgent payment": "Urgent payment pressure",
    }[cite: 1]
    lower = job_text.lower()[cite: 1]
    signals = [description for phrase, description in risk_patterns.items() if phrase in lower][cite: 1]
    score = min(100, len(signals) * 22)[cite: 1]
    return {
        "score": score,
        "level": "HIGH RISK" if score >= 55 else "MEDIUM RISK" if score >= 25 else "LOW RISK",
        "signals": len(signals),
        "signal_details": signals,
        "source": "local-fallback",
    }[cite: 1]


def api_career_roadmap(resume_text: str, target_role: str) -> Dict[str, Any]:
    try:
        payload = {"resume_text": resume_text, "target_role": target_role}[cite: 1]
        res = requests.post(f"{API_BASE_URL}/api/career/roadmap", json=payload, timeout=30)[cite: 1]
        if res.status_code == 200:[cite: 1]
            return res.json()[cite: 1]
    except Exception:
        pass[cite: 1]
    return {
        "steps": [
            f"Step 1: Strengthen foundational architecture in {target_role}.",
            "Step 2: Build an end-to-end production portfolio showcasing measurable throughput.",
            "Step 3: Refactor achievements into the Google XYZ format.",
            "Step 4: Practice domain mock interview questions and system design scenarios.",
        ]
    }[cite: 1]


def api_salary_estimate(role: str, experience: str, location: str) -> Dict[str, Any]:
    try:
        res = requests.post(f"{API_BASE_URL}/api/salary/estimate", json={"role": role, "experience": experience, "location": location}, timeout=20)[cite: 1]
        if res.ok and isinstance(res.json(), dict): return res.json()[cite: 1]
    except (requests.RequestException, ValueError, TypeError):
        pass[cite: 1]
    role_l = role.lower()[cite: 1]
    base = 4.5[cite: 1]
    if any(x in role_l for x in ("ai", "machine learning", "data scientist", "cloud", "cyber")): base = 7.0[cite: 1]
    elif any(x in role_l for x in ("software", "developer", "devops")): base = 5.5[cite: 1]
    elif any(x in role_l for x in ("product", "manager")): base = 6.0[cite: 1]
    elif any(x in role_l for x in ("finance", "account")): base = 4.0[cite: 1]
    if "Mid" in experience: base *= 1.45[cite: 1]
    elif "Senior" in experience: base *= 2.0[cite: 1]
    elif "Lead" in experience: base *= 2.6[cite: 1]
    return {"role": role, "experience": experience, "location": location, "min_lpa": round(base * .85, 1), "max_lpa": round(base * 1.8, 1), "note": "Indicative India estimate based on role family and experience. Verify against current market listings before making decisions.", "source": "local-estimate-v4"}[cite: 1]


def api_chat_assistant(messages: List[Dict], resume_context: str = "") -> str:
    try:
        payload = {"messages": messages, "resume_context": resume_context}[cite: 1]
        res = requests.post(f"{API_BASE_URL}/api/chat/ask", json=payload, timeout=45)[cite: 1]
        if res.status_code == 200:[cite: 1]
            return res.json().get("reply", "")[cite: 1]
    except Exception:
        pass[cite: 1]
    return "Focus on quantifiable business outcomes, active GitHub portfolio proof, and modern architecture patterns for the best results."[cite: 1]


def api_send_assessment_email(to_email: str, name: str, role: str, test_link: str, company: str = "", recruiter_name: str = "", recruiter_email: str = "", duration_minutes: int = 30, question_count: int = 20) -> tuple[bool, str]:
    subject = f"{company or 'CareerLens AI'} — Assessment Invitation for {role}"[cite: 1]
    recruiter_line = html.escape(recruiter_name or "Recruiting Team")[cite: 1]
    company_line = html.escape(company or "CareerLens AI")[cite: 1]
    recruiter_email_line = f"<div style=\"font-size:12px;color:#64748b;margin-top:4px;\">Contact: {html.escape(recruiter_email)}</div>" if recruiter_email else ""[cite: 1]
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background:#ffffff;">
        <div style="font-size:12px;color:#64748b;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Assessment Invitation</div>
        <h2 style="color: #2563eb; margin-bottom:6px;">{company_line}</h2>
        <div style="font-size:13px;color:#475569;margin-bottom:20px;">Recruiter: <b>{recruiter_line}</b>{recruiter_email_line}</div>
        <p>Hi <b>{html.escape(name)}</b>,</p>
        <p>You have been invited to complete a qualifying <b>Role-Based Pre-Employment Assessment</b> for the <b>{html.escape(role)}</b> position.</p>
        <p style="color:#475569;font-size:13px;"><b>{int(question_count)} questions</b> · <b>{int(duration_minutes)} minutes</b> · one question at a time · review before submission.</p>
        <div style="margin: 26px 0; text-align: center;">
            <a href="{test_link}" style="background-color: #2563eb; color: #ffffff; padding: 13px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Assessment</a>
        </div>
        <p style="color: #64748b; font-size: 0.9em;">Assessment link:</p>
        <p style="word-break: break-all; color: #2563eb; font-size: 0.85em;">{test_link}</p>
        <div style="margin-top:22px;padding-top:14px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">Please contact the recruiter above if you have questions about this assessment.</div>
    </div>
    """[cite: 1]
    payload = {
        "to_email": to_email,
        "subject": subject,
        "content": html_content,
    }[cite: 1]
    try:
        res = requests.post(f"{API_BASE_URL}/api/send-email", json=payload, timeout=20)[cite: 1]
        if res.status_code == 200:[cite: 1]
            return True, "Email accepted by backend"[cite: 1]
        data = res.json() if res.content else {}[cite: 1]
        return False, data.get("detail", f"Backend returned {res.status_code}")[cite: 1]
    except Exception as exc:
        return False, str(exc)[cite: 1]


# ============================================================
# STATE INITIALIZATION
# ============================================================
defaults = {
    "is_logged_in": False,
    "user_id": "",
    "username": "Guest Explorer",
    "selected_gateway": False,
    "active_workspace": "Job Seeker Workspace",
    "active_tool": "Dashboard",
    "resume_text": "",
    "resume_analysis": None,
    "job_match_result": None,
    "interview_active": False,
    "interview_role": "",
    "interview_company": "",
    "interview_q_count": 20,
    "interview_current_idx": 0,
    "interview_questions": [],
    "interview_transcript": [],
    "interview_completed": False,
    "interview_report": None,
    "assessment_active": False,
    "assessment_role": "Software Developer",
    "assessment_questions": [],
    "assessment_answers": {},
    "assessment_submitted": False,
    "assessment_candidate_token": "",
    "assessment_question_count": 20,
    "assessment_review": False,
    "assessment_result": None,
    "recruiter_assessment_duration": 30,
    "assessment_selected_role": "Software Developer",
    "job_detection_result": None,
    "job_detection_text": "",
    "resume_builder": {},
    "resume_template": "Executive",
    "salary_result": None,
    "assistant_messages": [],
    "recruiter_nav_history": ["Dashboard"],
    "recruiter_nav_index": 0,
    "recruiter_selected_ids": [],
}[cite: 1]

for key, val in defaults.items():[cite: 1]
    if key not in st.session_state:[cite: 1]
        st.session_state[key] = val[cite: 1]

RECRUITER_TOOLS = [
    "Dashboard",
    "Hiring Campaign",
    "Bulk Screening",
    "Shortlisted Candidates",
    "Assessment Builder",
    "Score Vault",
    "Interview Pipeline",
][cite: 1]


def recruiter_navigate(tool: str, record_history: bool = True) -> None:
    if tool not in RECRUITER_TOOLS:[cite: 1]
        tool = "Dashboard"[cite: 1]
    history = list(st.session_state.get("recruiter_nav_history", ["Dashboard"]))[cite: 1]
    index = int(st.session_state.get("recruiter_nav_index", 0))[cite: 1]
    current = history[index] if history and 0 <= index < len(history) else st.session_state.get("active_tool", "Dashboard")[cite: 1]
    if record_history:[cite: 1]
        history = history[: index + 1][cite: 1]
        if current != tool:[cite: 1]
            history.append(tool)[cite: 1]
        index = len(history) - 1[cite: 1]
    else:
        if tool in history:[cite: 1]
            index = history.index(tool)[cite: 1]
        else:
            history.append(tool)[cite: 1]
            index = len(history) - 1[cite: 1]
    st.session_state.recruiter_nav_history = history[cite: 1]
    st.session_state.recruiter_nav_index = index[cite: 1]
    st.session_state.active_tool = tool[cite: 1]


def recruiter_go_back() -> bool:
    history = st.session_state.get("recruiter_nav_history", ["Dashboard"])[cite: 1]
    index = int(st.session_state.get("recruiter_nav_index", 0))[cite: 1]
    if index <= 0:[cite: 1]
        return False[cite: 1]
    index -= 1[cite: 1]
    st.session_state.recruiter_nav_index = index[cite: 1]
    st.session_state.active_tool = history[index][cite: 1]
    return True[cite: 1]


def recruiter_go_forward() -> bool:
    history = st.session_state.get("recruiter_nav_history", ["Dashboard"])[cite: 1]
    index = int(st.session_state.get("recruiter_nav_index", 0))[cite: 1]
    if index >= len(history) - 1:[cite: 1]
        return False[cite: 1]
    index += 1[cite: 1]
    st.session_state.recruiter_nav_index = index[cite: 1]
    st.session_state.active_tool = history[index][cite: 1]
    return True[cite: 1]


def _load_recruiter_data() -> Dict[str, Any]:
    default = {"campaign": None, "candidates": [], "assessments": [], "submissions": []}[cite: 1]
    if st.session_state.get("user_id"):[cite: 1]
        data = _db_load_recruiter_state(st.session_state.user_id)[cite: 1]
        for key, value in default.items():[cite: 1]
            data.setdefault(key, value)[cite: 1]
        return data[cite: 1]
    return default[cite: 1]


def _save_recruiter_data(data: Dict[str, Any]) -> None:
    if st.session_state.get("user_id"):[cite: 1]
        try:
            _db_save_recruiter_state(st.session_state.user_id, data)[cite: 1]
        except sqlite3.Error:
            pass[cite: 1]


def _assessment_signing_secret() -> bytes:
    secret = os.getenv("ASSESSMENT_SIGNING_SECRET", "").strip()[cite: 1]
    if not secret:[cite: 1]
        try:
            secret = str(st.secrets.get("ASSESSMENT_SIGNING_SECRET", "") or "").strip()[cite: 1]
        except Exception:
            secret = ""[cite: 1]
    if not secret:[cite: 1]
        secret = "CareerLensAI-public-assessment-v1-2026"[cite: 1]
    return secret.encode("utf-8")[cite: 1]


def _make_assessment_token(payload: Optional[Dict[str, Any]] = None) -> str:
    data = dict(payload or {})[cite: 1]
    data.setdefault("v", 1)[cite: 1]
    data.setdefault("id", uuid.uuid4().hex)[cite: 1]
    data.setdefault("iat", int(datetime.now().timestamp()))[cite: 1]
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")[cite: 1]
    encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")[cite: 1]
    signature = hmac.new(_assessment_signing_secret(), encoded.encode("ascii"), hashlib.sha256).digest()[cite: 1]
    sig = base64.urlsafe_b64encode(signature).decode("ascii").rstrip("=")[cite: 1]
    return f"{encoded}.{sig}"[cite: 1]


def _decode_assessment_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        encoded, sig = str(token or "").split(".", 1)[cite: 1]
        expected = hmac.new(_assessment_signing_secret(), encoded.encode("ascii"), hashlib.sha256).digest()[cite: 1]
        supplied = base64.urlsafe_b64decode(sig + "=" * (-len(sig) % 4))[cite: 1]
        if not hmac.compare_digest(expected, supplied):[cite: 1]
            return None[cite: 1]
        raw = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))[cite: 1]
        payload = json.loads(raw.decode("utf-8"))[cite: 1]
        if not isinstance(payload, dict):[cite: 1]
            return None[cite: 1]
        issued = int(payload.get("iat", 0) or 0)[cite: 1]
        if issued and datetime.now().timestamp() - issued > 30 * 24 * 60 * 60:[cite: 1]
            return None[cite: 1]
        return payload[cite: 1]
    except (ValueError, TypeError, json.JSONDecodeError, UnicodeDecodeError, binascii.Error):
        return None[cite: 1]


def _assessment_public_url(token: str) -> str:
    token = str(token or "").strip()[cite: 1]
    if not token:[cite: 1]
        raise ValueError("Assessment token is required.")[cite: 1]
    return f"{PUBLIC_APP_URL}/?assessment={quote(token, safe='')}"[cite: 1]


IST = ZoneInfo("Asia/Kolkata")[cite: 1]

def _now_ist() -> datetime:
    return datetime.now(IST)[cite: 1]


def _as_ist(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:[cite: 1]
        return None[cite: 1]
    if value.tzinfo is None:[cite: 1]
        return value.replace(tzinfo=IST)[cite: 1]
    return value.astimezone(IST)[cite: 1]


def _parse_assessment_time(value: str) -> Optional[datetime]:
    value = str(value or "").strip()[cite: 1]
    if not value:[cite: 1]
        return None[cite: 1]
    try:
        return _as_ist(datetime.fromisoformat(value))[cite: 1]
    except (ValueError, TypeError):
        return None[cite: 1]


def _assessment_window_state(assessment: Dict[str, Any]) -> str:
    now = _now_ist()[cite: 1]
    start = _parse_assessment_time(assessment.get("start_at"))[cite: 1]
    end = _parse_assessment_time(assessment.get("end_at"))[cite: 1]
    if start and now < start:[cite: 1]
        return "scheduled"[cite: 1]
    if end and now >= end:[cite: 1]
        return "closed"[cite: 1]
    return "live"[cite: 1]


def _assessment_datetime_string(date_value, time_value) -> str:
    combined = datetime.combine(date_value, time_value)[cite: 1]
    return combined.replace(tzinfo=IST).isoformat(timespec="seconds")[cite: 1]


def _assessment_time_options(step_minutes: int = 15) -> List[str]:
    values = [][cite: 1]
    for minutes in range(0, 24 * 60, step_minutes):[cite: 1]
        h, m = divmod(minutes, 60)[cite: 1]
        values.append(datetime(2000, 1, 1, h, m).strftime("%I:%M %p").lstrip("0"))[cite: 1]
    return values[cite: 1]


def _parse_12h_time(label: str) -> dt_time:
    return datetime.strptime(str(label).strip(), "%I:%M %p").time()[cite: 1]

def _save_public_assessment_record(owner_user_id: str, candidate_id: str, assessment: Dict[str, Any], token: str) -> None:
    if not owner_user_id or not candidate_id or not token:[cite: 1]
        return[cite: 1]
    conn = get_db_connection()[cite: 1]
    payload = json.dumps(assessment, ensure_ascii=False)[cite: 1]
    expires_at = str(assessment.get("end_at", "") or "").strip() or (_now_ist() + timedelta(days=30)).isoformat(timespec="seconds")[cite: 1]
    with conn:
        conn.execute(
            """INSERT INTO public_assessments(token, owner_user_id, candidate_id, assessment_json, created_at, expires_at, used)
               VALUES(?,?,?,?,?,?,0)
               ON CONFLICT(token) DO UPDATE SET owner_user_id=excluded.owner_user_id, candidate_id=excluded.candidate_id, assessment_json=excluded.assessment_json, created_at=excluded.created_at, expires_at=excluded.expires_at""",
            (token, owner_user_id, candidate_id, payload, datetime.now().isoformat(timespec="seconds"), expires_at),
        )[cite: 1]


def _load_public_assessment_record(token: str):
    token = str(token or "").strip()[cite: 1]
    if not token:[cite: 1]
        return None, None, None, None[cite: 1]
    try:
        conn = get_db_connection()[cite: 1]
        row = conn.execute(
            "SELECT owner_user_id, candidate_id, assessment_json, expires_at, used FROM public_assessments WHERE token=?",
            (token,),
        ).fetchone()[cite: 1]
        if not row:[cite: 1]
            return None, None, None, None[cite: 1]
        owner_user_id, candidate_id, assessment_json, expires_at, used = row[cite: 1]
        if expires_at:[cite: 1]
            try:
                if _as_ist(datetime.fromisoformat(expires_at)) < _now_ist():[cite: 1]
                    return None, None, None, None[cite: 1]
            except ValueError:
                pass[cite: 1]
        assessment = json.loads(assessment_json) if isinstance(assessment_json, str) else {}[cite: 1]
        if not isinstance(assessment, dict):[cite: 1]
            return None, None, None, None[cite: 1]
        assessment["used"] = bool(used)[cite: 1]
        data = _db_load_recruiter_state(owner_user_id)[cite: 1]
        candidate = next((c for c in data.get("candidates", []) if c.get("id") == candidate_id), None)[cite: 1]
        if candidate is None:[cite: 1]
            return None, None, None, None[cite: 1]
        return assessment, candidate, candidate_id, owner_user_id[cite: 1]
    except (sqlite3.Error, TypeError, ValueError, json.JSONDecodeError):
        return None, None, None, None[cite: 1]


if "recruiter_data" not in st.session_state:[cite: 1]
    st.session_state.recruiter_data = _load_recruiter_data()[cite: 1]
if "recruiter_candidates" not in st.session_state:[cite: 1]
    st.session_state.recruiter_candidates = st.session_state.recruiter_data.get("candidates", [])[cite: 1]
if "recruiter_assessment_submissions" not in st.session_state:[cite: 1]
    st.session_state.recruiter_assessment_submissions = {
        item.get("token", str(index)): item
        for index, item in enumerate(st.session_state.recruiter_data.get("submissions", []))
        if isinstance(item, dict)
    }[cite: 1]

IT_ROLES = ["Software Developer", "Data Scientist", "Data Analyst", "DevOps Engineer", "Cybersecurity Analyst", "Cloud Engineer", "QA Engineer"][cite: 1]
NON_IT_ROLES = ["HR Specialist", "Sales Executive", "Marketing Manager", "Finance Analyst", "Operations Manager", "Customer Support Specialist"][cite: 1]


def _resume_interview_context(resume_text: str) -> Dict[str, Any]:
    text = (resume_text or "").strip()[cite: 1]
    lower = text.lower()[cite: 1]
    skills = sorted(_skill_set(text))[cite: 1]
    lines = [re.sub(r"\s+", " ", x).strip() for x in text.splitlines() if x.strip()][cite: 1]
    project_lines = [x for x in lines if any(k in x.lower() for k in ("project", "developed", "built", "implemented", "created"))][:6][cite: 1]
    experience_lines = [x for x in lines if any(k in x.lower() for k in ("experience", "intern", "worked", "employment", "developer", "engineer"))][:6][cite: 1]
    return {
        "skills": skills[:20],
        "projects": project_lines,
        "experience": experience_lines,
        "name": (re.search(r"(?:^|\n)\s*([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,4})\s*(?:\n|$)", text) or ["", ""])[1] if text else "",
        "has_resume": bool(text),
        "word_count": len(re.findall(r"\b[a-zA-Z]{2,}\b", text)),
    }[cite: 1]


def generate_mock_interview_questions(role: str, count: int, resume_text: str = "", company: str = "") -> List[str]:
    role = role.strip() or "the target role"[cite: 1]
    ctx = _resume_interview_context(resume_text)[cite: 1]
    company_name = company.strip() or "this company"[cite: 1]
    bank: List[str] = [
        f"Please introduce yourself and walk me through your background, focusing on what makes you a strong candidate for the {role} role.",
        f"Why have you chosen to pursue a career as a {role}, and what interests you most about this role?",
        f"Why do you want to work at {company_name}, and what do you think you could contribute here?",
        "Which achievement on your resume are you most proud of, and why?",
    ][cite: 1]
    if ctx["skills"]:[cite: 1]
        for skill in ctx["skills"][:8]:[cite: 1]
            bank.append(f"Your resume mentions {skill}. How have you used {skill} in a real project, job, internship, or academic setting? Give me a specific example.")[cite: 1]
            bank.append(f"How would you rate your {skill} ability today, and what have you done recently to improve it?")[cite: 1]
    if ctx["projects"]:[cite: 1]
        for project in ctx["projects"][:4]:[cite: 1]
            bank.append(f"I noticed this resume evidence: \"{project}\". Walk me through what you personally did, the main challenge, and the result.")[cite: 1]
    if ctx["experience"]:[cite: 1]
        for item in ctx["experience"][:3]:[cite: 1]
            bank.append(f"Your resume includes this experience: \"{item}\". What was your responsibility, and how did your work create value?")[cite: 1]
    bank.extend([
        "Tell me about a difficult problem you solved. What was your reasoning, what actions did you take, and what was the outcome?",
        "Tell me about a mistake or failure in a project or job. What did you learn and what did you change afterward?",
        "Describe a disagreement with a teammate or stakeholder and how you resolved it.",
        "Tell me about a time you received difficult feedback. How did you respond?",
        "How do you prioritize when several important tasks are competing for your attention?",
        "What would you want to accomplish during your first 30, 60, and 90 days in this role?",
        f"What is the biggest skill gap you currently have for the {role} role, and how are you working on it?",
        "Where do you want your career to develop over the next few years?",
        "Do you have any questions you would ask me as the interviewer?",
    ])[cite: 1]
    target = max(20, min(50, int(count or 20)))[cite: 1]
    if len(bank) < target:[cite: 1]
        bank.extend([f"As a {role}, describe how you would approach a realistic high-priority situation and explain your reasoning."] * (target - len(bank)))[cite: 1]
    return bank[:max(target, len(bank))][cite: 1]


def generate_next_interview_question(role: str, resume_text: str, transcript: List[Dict[str, Any]], bank: List[str]) -> str:
    used = {str(x.get("question", "")) for x in transcript}[cite: 1]
    remaining = [q for q in bank if q not in used][cite: 1]
    if not remaining:[cite: 1]
        idx = len(transcript) + 1[cite: 1]
        return f"Question {idx}: As a {role}, describe a realistic challenge you would face and explain how you would solve it step by step."[cite: 1]
    if transcript:[cite: 1]
        answer = str(transcript[-1].get("answer", "")).lower()[cite: 1]
        if len(answer.split()) < 20:[cite: 1]
            follow = "Can you give me a specific example from your resume or experience that supports that answer?"[cite: 1]
            if follow not in used:[cite: 1]
                return follow[cite: 1]
        if any(k in answer for k in ("project", "built", "developed", "implemented")):[cite: 1]
            follow = "What was the hardest technical or practical decision you made in that project, and what trade-off did you consider?"[cite: 1]
            if follow not in used:[cite: 1]
                return follow[cite: 1]
    return remaining[0][cite: 1]


def score_mock_interview(transcript: List[Dict[str, Any]], role: str) -> Dict[str, Any]:
    if not transcript:[cite: 1]
        return {"overall": 0, "communication": 0, "completeness": 0, "relevance": 0, "evidence": 0, "strengths": [], "improvements": ["Provide answers before ending the interview."]}[cite: 1]
    lengths = [len(str(x.get("answer", "")).split()) for x in transcript][cite: 1]
    substantive = sum(1 for n in lengths if n >= 30)[cite: 1]
    completeness = round(substantive / len(lengths) * 100)[cite: 1]
    avg = min(100, round(sum(lengths) / len(lengths) * 2.2))[cite: 1]
    evidence_words = ("because", "result", "impact", "example", "metric", "improved", "learned", "built", "developed", "implemented")[cite: 1]
    evidence_hits = sum(1 for x in transcript if any(k in str(x.get("answer", "")).lower() for k in evidence_words))[cite: 1]
    relevance_hits = sum(1 for x in transcript if role.lower() in str(x.get("answer", "")).lower() or any(k in str(x.get("answer", "")).lower() for k in ("project", "experience", "skill", "role")))[cite: 1]
    evidence = min(100, round(evidence_hits / len(transcript) * 100))[cite: 1]
    relevance = min(100, round(relevance_hits / len(transcript) * 100))[cite: 1]
    communication = min(100, round(avg * .60 + evidence * .20 + relevance * .20))[cite: 1]
    overall = max(5, min(98, round(communication * .45 + completeness * .25 + evidence * .15 + relevance * .15)))[cite: 1]
    strengths = [f"Completed {len(transcript)} interview responses for {role}."][cite: 1]
    if avg >= 55: strengths.append("Answers generally contain useful detail rather than one-line responses.")[cite: 1]
    if evidence >= 50: strengths.append("Several answers use examples, actions, outcomes or measurable evidence.")[cite: 1]
    if relevance >= 60: strengths.append("Responses show reasonable alignment with the target role and experience.")[cite: 1]
    improvements = [][cite: 1]
    if completeness < 70: improvements.append("Use fuller answers with context, action and result instead of short statements.")[cite: 1]
    if evidence < 50: improvements.append("Use concrete resume examples and quantify outcomes whenever possible.")[cite: 1]
    if relevance < 60: improvements.append(f"Tie more answers directly to the {role} responsibilities and your actual experience.")[cite: 1]
    if not improvements: improvements.append("Keep practicing concise, evidence-based answers and prepare deeper follow-up examples.")[cite: 1]
    return {"overall": overall, "communication": communication, "completeness": completeness, "relevance": relevance, "evidence": evidence, "strengths": strengths, "improvements": improvements}[cite: 1]


def generate_assessment_questions(role: str, count: int, seed: str = "") -> List[Dict[str, Any]]:
    role_l = (role or "").lower().strip()[cite: 1]
    bank: List[tuple[str, List[str], int]] = [][cite: 1]

    def add(items):
        bank.extend(items)[cite: 1]

    if any(x in role_l for x in ("ai", "machine learning", "ml engineer")):[cite: 1]
        add([
            ("Which practice helps detect overfitting in a machine-learning model?", ["Validation data", "More UI colors", "Disabling metrics", "Removing labels"], 0),
            ("What should be monitored after deploying an ML model?", ["Prediction quality and data drift", "Only file names", "Keyboard layout", "Screen brightness"], 0),
            ("Why is feature leakage dangerous?", ["It gives the model information unavailable at prediction time", "It improves security", "It removes all bias", "It reduces storage cost"], 0),
            ("Which metric is useful for an imbalanced classification problem?", ["F1-score", "File size", "CPU temperature", "Row height"], 0),
            ("Why is a separate test set useful?", ["It provides a final estimate on unseen data", "It trains the model twice", "It removes all missing values", "It guarantees perfect accuracy"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("data scientist", "data analyst", "analytics")):[cite: 1]
        add([
            ("What is the first step when an analysis produces a surprising result?", ["Validate data quality and assumptions", "Publish immediately", "Delete outliers without review", "Change the chart colors"], 0),
            ("What does precision measure in classification?", ["Correct positives among predicted positives", "Correct positives among all actual positives", "All correct predictions", "Only false negatives"], 0),
            ("Why use cross-validation?", ["Estimate generalization during model selection", "Encrypt the dataset", "Create invoices", "Remove all missing values automatically"], 0),
            ("Which tool is commonly used for spreadsheet-based business analysis?", ["Excel", "Docker", "Kubernetes", "Git"], 0),
            ("What is a useful first check before building a dashboard?", ["Confirm definitions, data quality and business questions", "Add as many charts as possible", "Hide missing values", "Remove filters"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("software", "developer", "programmer", "devops", "cloud", "cyber", "qa", "engineer")):[cite: 1]
        add([
            ("Which practice improves software reliability before release?", ["Automated tests and review", "Skipping validation", "Hard-coding secrets", "Ignoring errors"], 0),
            ("What does version control primarily provide?", ["A history of code changes and collaboration", "Automatic salary calculation", "Network encryption by itself", "Hardware monitoring"], 0),
            ("Which approach is safer for production secrets?", ["Secret management/environment injection", "Hard-coding them in source control", "Putting them in client HTML", "Sharing them in chat"], 0),
            ("What is a useful response to a production regression?", ["Contain, inspect telemetry, fix and verify", "Delete logs", "Disable monitoring", "Ignore it"], 0),
            ("Which HTTP status normally indicates successful resource creation?", ["201", "301", "401", "500"], 0),
            ("Which data structure is best suited for fast average O(1) key lookup?", ["Hash table", "Linked list", "Stack only", "Binary file"], 0),
            ("Why are code reviews valuable?", ["They catch defects and improve maintainability through shared knowledge", "They replace all testing", "They guarantee zero bugs", "They remove the need for documentation"], 0),
            ("What is a good API design practice?", ["Validate input and return clear, consistent responses", "Expose secrets in responses", "Ignore malformed input", "Change response formats randomly"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("hr", "human resource", "recruit", "talent")):[cite: 1]
        add([
            ("Which metric can help evaluate recruitment efficiency?", ["Time to hire", "Monitor brightness", "Keyboard speed", "File extension"], 0),
            ("What is a good approach to a sensitive employee issue?", ["Listen, document facts, follow policy and protect confidentiality", "Discuss it publicly", "Ignore documentation", "Share private details widely"], 0),
            ("What improves candidate experience?", ["Clear communication and timely updates", "Unexplained delays", "Hidden requirements", "Repeated duplicate forms"], 0),
            ("Why should structured interview criteria be used?", ["To improve consistency and fair comparison", "To avoid taking notes", "To guarantee every candidate gets the same answer", "To remove role requirements"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("marketing", "seo", "brand")):[cite: 1]
        add([
            ("Which metric helps evaluate campaign efficiency?", ["Conversion rate", "Screen resolution", "File size", "Keyboard layout"], 0),
            ("What should a marketer do when conversion suddenly drops?", ["Check funnel data and test likely causes", "Change everything randomly", "Delete analytics", "Ignore the change"], 0),
            ("Why segment an audience?", ["To tailor messages to meaningful groups", "To remove all analytics", "To guarantee every user behaves identically", "To avoid testing"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("finance", "account", "audit")):[cite: 1]
        add([
            ("What should happen before relying on a financial report?", ["Reconcile and validate the underlying data", "Skip checks", "Delete source records", "Publish without review"], 0),
            ("What is variance analysis used for?", ["Understand differences between actual and planned values", "Encrypt passwords", "Design a website", "Manage source code"], 0),
            ("Which skill is commonly useful in financial analysis?", ["Spreadsheet modeling", "Container orchestration", "CSS animation", "DNS routing"], 0),
        ])[cite: 1]
    elif any(x in role_l for x in ("project manager", "product manager", "operations manager")):[cite: 1]
        add([
            ("How should competing priorities be handled?", ["Evaluate impact, urgency, dependencies and stakeholder needs", "Pick randomly", "Ignore dependencies", "Do everything simultaneously"], 0),
            ("What is a useful project success measure?", ["Delivery against agreed outcomes, scope, quality and time", "Number of meetings only", "Number of emails", "Screen size"], 0),
            ("How should stakeholder disagreement be handled?", ["Clarify goals, evidence, constraints and trade-offs", "Hide the disagreement", "Choose without context", "Stop documenting decisions"], 0),
        ])[cite: 1]
    else:
        add([
            (f"What is most important when performing the {role or 'target'} role?", ["Delivering role-relevant outcomes with quality and accountability", "Avoiding feedback", "Ignoring requirements", "Skipping validation"], 0),
            ("What is a strong way to demonstrate competence?", ["Concrete examples with actions and measurable outcomes", "Only listing buzzwords", "Avoiding examples", "Using copied answers"], 0),
            ("How should you approach an unfamiliar task?", ["Clarify the goal, research, plan, execute and verify", "Guess and never check", "Avoid the task", "Hide uncertainty"], 0),
            ("What helps professional growth?", ["Deliberate practice, feedback and evidence of improvement", "Avoiding new tasks", "Never reviewing work", "Ignoring feedback"], 0),
        ])[cite: 1]

    bank.extend([
        (f"Why are measurable outcomes valuable for a {role or 'professional'}?", ["They show the impact of the work", "They replace all skills", "They remove the need for communication", "They guarantee promotion"], 0),
        ("What is the best response when you discover an error in your work?", ["Acknowledge it, assess impact, correct it and learn from it", "Hide it", "Delete evidence", "Blame someone else"], 0),
        ("Which behavior demonstrates ownership?", ["Following through, communicating risks and delivering agreed outcomes", "Waiting for every instruction", "Ignoring blockers", "Avoiding accountability"], 0),
        ("Which approach is strongest when requirements are unclear?", ["Clarify assumptions and confirm the expected outcome", "Start coding without context", "Ignore the requirement", "Wait indefinitely"], 0),
        ("What makes an assessment answer stronger?", ["Accurate reasoning supported by relevant knowledge", "Guessing quickly", "Copying another person's response", "Leaving every answer blank"], 0),
    ])[cite: 1]

    target = max(10, min(50, int(count or 10)))[cite: 1]
    rng = random.Random(str(seed or role_l or "careerlens"))[cite: 1]
    indexed = list(enumerate(bank))[cite: 1]
    rng.shuffle(indexed)[cite: 1]

    selected: List[tuple[str, List[str], int]] = [][cite: 1]
    for _, item in indexed:[cite: 1]
        selected.append(item)[cite: 1]
        if len(selected) >= min(target, len(bank)):[cite: 1]
            break[cite: 1]

    while len(selected) < target:[cite: 1]
        base = bank[(len(selected) - len(bank)) % len(bank)][cite: 1]
        cycle = (len(selected) // max(1, len(bank))) + 1[cite: 1]
        selected.append((f"{base[0]} (Scenario {cycle})", list(base[1]), base[2]))[cite: 1]

    questions: List[Dict[str, Any]] = [][cite: 1]
    for i, (q_text, options, correct_idx) in enumerate(selected[:target], start=1):[cite: 1]
        option_pairs = list(enumerate(options))[cite: 1]
        rng.shuffle(option_pairs)[cite: 1]
        shuffled_options = [text for _, text in option_pairs][cite: 1]
        correct_answer = options[correct_idx][cite: 1]
        questions.append({
            "id": i,
            "section": "Core Skills" if i <= round(target * 0.6) else "Applied Scenarios",
            "question": q_text,
            "options": shuffled_options,
            "answer": correct_answer,
        })[cite: 1]
    return questions[cite: 1]

def assessment_result(questions: List[Dict], answers: Dict) -> Dict[str, Any]:
    correct_items, wrong_items, unanswered_items = [], [], [][cite: 1]
    for q in questions:[cite: 1]
        selected = answers.get(q["id"])[cite: 1]
        item = {"id": q["id"], "question": q["question"], "selected": selected, "correct": q["answer"], "options": q["options"]}[cite: 1]
        if selected is None:[cite: 1]
            unanswered_items.append(item)[cite: 1]
        elif selected == q["answer"]:[cite: 1]
            correct_items.append(item)[cite: 1]
        else:
            wrong_items.append(item)[cite: 1]
    total = len(questions)[cite: 1]
    correct = len(correct_items)[cite: 1]
    return {
        "score": correct,
        "total": total,
        "percentage": round((correct / total) * 100, 1) if total else 0,
        "correct_count": correct,
        "wrong_count": len(wrong_items),
        "unanswered_count": len(unanswered_items),
        "correct_items": correct_items,
        "wrong_items": wrong_items,
        "unanswered_items": unanswered_items,
        "submitted_at": _now_ist().strftime("%Y-%m-%d %I:%M %p IST"),
    }[cite: 1]


def _escape(value: str) -> str:
    return html.escape(str(value or ""))[cite: 1]


def build_resume_pdf(data: Dict, template: str) -> bytes:
    buffer = io.BytesIO()[cite: 1]
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )[cite: 1]
    styles = getSampleStyleSheet()[cite: 1]

    template_config = {
        "Executive": {"accent": "#1d4ed8", "title": 23, "align": TA_CENTER, "line": True},
        "Minimal": {"accent": "#111827", "title": 22, "align": TA_LEFT, "line": False},
        "Modern Blue": {"accent": "#2563eb", "title": 24, "align": TA_LEFT, "line": True},
        "Modern Purple": {"accent": "#7c3aed", "title": 24, "align": TA_LEFT, "line": True},
        "Emerald": {"accent": "#059669", "title": 23, "align": TA_LEFT, "line": True},
        "Professional": {"accent": "#334155", "title": 21, "align": TA_CENTER, "line": True},
        "Tech": {"accent": "#0284c7", "title": 24, "align": TA_LEFT, "line": True},
        "ATS Classic": {"accent": "#111827", "title": 20, "align": TA_LEFT, "line": False},
        "Classic Serif": {"accent": "#374151", "title": 23, "align": TA_CENTER, "line": True},
        "Corporate": {"accent": "#0f172a", "title": 22, "align": TA_LEFT, "line": True},
        "Clean Grid": {"accent": "#475569", "title": 22, "align": TA_LEFT, "line": True},
        "Modern ATS": {"accent": "#1e293b", "title": 21, "align": TA_LEFT, "line": True},
        "Creative": {"accent": "#db2777", "title": 24, "align": TA_CENTER, "line": True},
        "Elegant": {"accent": "#6b21a8", "title": 23, "align": TA_CENTER, "line": False},
        "Compact": {"accent": "#0f766e", "title": 20, "align": TA_LEFT, "line": True},
        "Bold Header": {"accent": "#b45309", "title": 25, "align": TA_LEFT, "line": True},
    }[cite: 1]
    cfg = template_config.get(template, template_config["Executive"])[cite: 1]
    accent = colors.HexColor(cfg["accent"])[cite: 1]

    title = ParagraphStyle(
        f"ResumeTitle_{template}", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=cfg["title"], leading=27, textColor=accent, alignment=cfg["align"], spaceAfter=4
    )[cite: 1]
    contact = ParagraphStyle(
        f"Contact_{template}", parent=styles["Normal"], fontSize=8.8, leading=12,
        textColor=colors.HexColor("#475569"), alignment=cfg["align"], spaceAfter=10
    )[cite: 1]
    heading = ParagraphStyle(
        f"Heading_{template}", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=10.5, leading=13, textColor=accent, spaceBefore=7, spaceAfter=4
    )[cite: 1]
    body = ParagraphStyle(
        f"Body_{template}", parent=styles["BodyText"], fontSize=8.8, leading=12,
        textColor=colors.HexColor("#1f2937"), spaceAfter=3
    )[cite: 1]

    story = [Paragraph(_escape(data.get("name", "Your Name")), title)][cite: 1]
    contact_bits = [data.get("email"), data.get("phone"), data.get("location"), data.get("linkedin"), data.get("github")][cite: 1]
    story.append(Paragraph(" &nbsp;•&nbsp; ".join(_escape(x) for x in contact_bits if x), contact))[cite: 1]

    if data.get("headline"):[cite: 1]
        story.append(Paragraph(
            _escape(data["headline"]),
            ParagraphStyle(
                f"Headline_{template}", parent=body, fontSize=10, leading=13,
                alignment=cfg["align"], textColor=colors.HexColor("#334155"), spaceAfter=8
            ),
        ))[cite: 1]

    if cfg["line"]:[cite: 1]
        story.append(Table([[""]], colWidths=[doc.width], rowHeights=[1.2], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), accent),
            ("LINEBELOW", (0, 0), (-1, -1), 0, accent),
        ])))[cite: 1]
        story.append(Spacer(1, 4))[cite: 1]

    sections = [
        ("PROFESSIONAL SUMMARY", data.get("summary")),
        ("EXPERIENCE", data.get("experience")),
        ("EDUCATION", data.get("education")),
        ("PROJECTS", data.get("projects")),
        ("SKILLS", data.get("skills")),
        ("CERTIFICATIONS", data.get("certifications")),
        ("ACHIEVEMENTS", data.get("achievements")),
    ][cite: 1]

    for heading_text, content in sections:[cite: 1]
        if not content:[cite: 1]
            continue[cite: 1]
        story.append(Paragraph(heading_text, heading))[cite: 1]
        if heading_text == "SKILLS":[cite: 1]
            skills = [x.strip() for x in str(content).split(",") if x.strip()][cite: 1]
            story.append(Paragraph(" • ".join(_escape(x) for x in skills), body))[cite: 1]
        else:
            for block in str(content).split("\n"):[cite: 1]
                block = block.strip()[cite: 1]
                if block:[cite: 1]
                    story.append(Paragraph(_escape(block), body))[cite: 1]

    doc.build(story)[cite: 1]
    return buffer.getvalue()[cite: 1]

def _find_recruiter_assessment_by_token(token: str):
    token = str(token or "").strip()[cite: 1]
    if not token:[cite: 1]
        return None, None, None, None[cite: 1]

    try:
        persisted = _load_public_assessment_record(token)[cite: 1]
        if persisted[0] is not None:[cite: 1]
            return persisted[cite: 1]
    except Exception:
        pass[cite: 1]

    payload = _decode_assessment_token(token)[cite: 1]
    if payload:[cite: 1]
        owner_user_id = str(payload.get("owner_user_id", ""))[cite: 1]
        candidate_id = str(payload.get("candidate_id", ""))[cite: 1]
        role = str(payload.get("role", "Professional Assessment"))[cite: 1]
        company = str(payload.get("company", "Company"))[cite: 1]
        recruiter_name = str(payload.get("recruiter_name", "Recruiting Team"))[cite: 1]
        recruiter_email = str(payload.get("recruiter_email", ""))[cite: 1]
        candidate_snapshot = payload.get("candidate", {}) if isinstance(payload.get("candidate"), dict) else {}[cite: 1]
        candidate = dict(candidate_snapshot)[cite: 1]

        if owner_user_id:[cite: 1]
            try:
                owner_data = _db_load_recruiter_state(owner_user_id)[cite: 1]
                stored = next((c for c in owner_data.get("candidates", []) if c.get("id") == candidate_id), None)[cite: 1]
                if stored:[cite: 1]
                    candidate = stored[cite: 1]
            except Exception:
                pass[cite: 1]

        assessment = {
            "id": str(payload.get("assessment_id", payload.get("id", ""))),
            "role": role,
            "company": company,
            "recruiter_name": recruiter_name,
            "recruiter_email": recruiter_email,
            "questions": generate_assessment_questions(role, int(payload.get("question_count", 20) or 20), seed=token),
            "duration_minutes": int(payload.get("duration_minutes", 30) or 30),
            "start_at": str(payload.get("start_at", "") or ""),
            "end_at": str(payload.get("end_at", "") or ""),
            "created_at": datetime.fromtimestamp(int(payload.get("iat", datetime.now().timestamp()))).isoformat(timespec="seconds"),
            "candidate_tokens": {candidate_id: token},
        }[cite: 1]
        if candidate.get("id") or candidate_id:[cite: 1]
            candidate.setdefault("id", candidate_id)[cite: 1]
        candidate.setdefault("name", "Candidate")[cite: 1]
        candidate.setdefault("email", "")[cite: 1]
        candidate.setdefault("assessment_status", "Sent")[cite: 1]
        if candidate:[cite: 1]
            return assessment, candidate, candidate_id, owner_user_id[cite: 1]

    try:
        found = _load_public_assessment_record(token)[cite: 1]
        if found[0] is not None:[cite: 1]
            return found[cite: 1]
    except Exception:
        pass[cite: 1]

    try:
        conn = get_db_connection()[cite: 1]
        rows = conn.execute("SELECT user_id, state_json FROM recruiter_state").fetchall()[cite: 1]
        for owner_user_id, state_json in rows:[cite: 1]
            try:
                owner_data = json.loads(state_json) if isinstance(state_json, str) else {}[cite: 1]
            except (TypeError, ValueError):
                continue[cite: 1]
            if not isinstance(owner_data, dict):[cite: 1]
                continue[cite: 1]
            owner_candidates = owner_data.get("candidates", []) or [][cite: 1]
            for assessment in owner_data.get("assessments", []) or []:[cite: 1]
                tokens = assessment.get("candidate_tokens", {}) if isinstance(assessment, dict) else {}[cite: 1]
                for candidate_id, candidate_token in tokens.items():[cite: 1]
                    if str(candidate_token) == token:[cite: 1]
                        candidate = next((c for c in owner_candidates if c.get("id") == candidate_id), None)[cite: 1]
                        if candidate:[cite: 1]
                            _save_public_assessment_record(owner_user_id, candidate_id, assessment, token)[cite: 1]
                            return assessment, candidate, candidate_id, owner_user_id[cite: 1]
    except sqlite3.Error:
        pass[cite: 1]
    return None, None, None, None[cite: 1]


def _resolve_submission_identity(token: str, owner_user_id: str, candidate_id: str):
    owner_user_id = str(owner_user_id or "").strip()[cite: 1]
    candidate_id = str(candidate_id or "").strip()[cite: 1]
    token = str(token or "").strip()[cite: 1]

    if token:[cite: 1]
        try:
            payload = _decode_assessment_token(token) or {}[cite: 1]
            owner_user_id = owner_user_id or str(payload.get("owner_user_id", "")).strip()[cite: 1]
            candidate_id = candidate_id or str(payload.get("candidate_id", "")).strip()[cite: 1]
        except Exception:
            pass[cite: 1]

    if token and (not owner_user_id or not candidate_id):[cite: 1]
        try:
            conn = get_db_connection()[cite: 1]
            row = conn.execute(
                "SELECT owner_user_id, candidate_id FROM public_assessments WHERE token=?",
                (token,),
            ).fetchone()[cite: 1]
            if row:[cite: 1]
                owner_user_id = owner_user_id or str(row[0] or "").strip()[cite: 1]
                candidate_id = candidate_id or str(row[1] or "").strip()[cite: 1]
        except sqlite3.Error:
            pass[cite: 1]

    return owner_user_id, candidate_id[cite: 1]


def _save_public_assessment_result(owner_user_id: str, assessment: Dict[str, Any], candidate_id: str, result: Dict[str, Any]) -> bool:
    token = str(result.get("token") or "").strip()[cite: 1]
    owner_user_id, candidate_id = _resolve_submission_identity(token, owner_user_id, candidate_id)[cite: 1]

    if not token or not owner_user_id or not candidate_id:[cite: 1]
        return False[cite: 1]

    submitted_at = str(result.get("submitted_at") or _now_ist().isoformat(timespec="seconds"))[cite: 1]
    result["token"] = token[cite: 1]
    result["candidate_id"] = candidate_id[cite: 1]
    result["submitted_at"] = submitted_at[cite: 1]

    conn = get_db_connection()[cite: 1]
    try:
        with conn:[cite: 1]
            conn.execute(
                """INSERT INTO assessment_submissions(
                    token, owner_user_id, candidate_id, assessment_id,
                    candidate_name, candidate_email, role, company,
                    recruiter_name, recruiter_email, score, total, percentage,
                    correct, incorrect, unanswered, submitted_at,
                    submission_type, result_json, created_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(token) DO UPDATE SET
                    owner_user_id=excluded.owner_user_id,
                    candidate_id=excluded.candidate_id,
                    assessment_id=excluded.assessment_id,
                    candidate_name=excluded.candidate_name,
                    candidate_email=excluded.candidate_email,
                    role=excluded.role,
                    company=excluded.company,
                    recruiter_name=excluded.recruiter_name,
                    recruiter_email=excluded.recruiter_email,
                    score=excluded.score,
                    total=excluded.total,
                    percentage=excluded.percentage,
                    correct=excluded.correct,
                    incorrect=excluded.incorrect,
                    unanswered=excluded.unanswered,
                    submitted_at=excluded.submitted_at,
                    submission_type=excluded.submission_type,
                    result_json=excluded.result_json""",
                (
                    token, owner_user_id, candidate_id,
                    str(result.get("assessment_id") or assessment.get("id") or ""),
                    str(result.get("candidate_name") or "Candidate"),
                    str(result.get("candidate_email") or ""),
                    str(result.get("role") or assessment.get("role") or ""),
                    str(result.get("company") or assessment.get("company") or ""),
                    str(result.get("recruiter_name") or assessment.get("recruiter_name") or ""),
                    str(result.get("recruiter_email") or assessment.get("recruiter_email") or ""),
                    float(result.get("score") or 0),
                    int(result.get("total") or 0),
                    float(result.get("percentage") or 0),
                    int(result.get("correct") or 0),
                    int(result.get("incorrect") or 0),
                    int(result.get("unanswered") or 0),
                    submitted_at,
                    str(result.get("submission_type") or "Candidate submitted"),
                    json.dumps(result, ensure_ascii=False),
                    _now_ist().isoformat(timespec="seconds"),
                ),
            )[cite: 1]
            conn.execute("UPDATE public_assessments SET used=1 WHERE token=?", (token,))[cite: 1]
    except sqlite3.Error:
        return False[cite: 1]

    try:
        data = _db_load_recruiter_state(owner_user_id)[cite: 1]
        owner_candidates = data.get("candidates", []) or [][cite: 1]
        candidate = next((c for c in owner_candidates if str(c.get("id", "")) == candidate_id), None)[cite: 1]

        if candidate is None:[cite: 1]
            candidate = {
                "id": candidate_id,
                "name": result.get("candidate_name", "Candidate"),
                "email": result.get("candidate_email", ""),
                "role_match": 0,
                "resume_score": 0,
            }[cite: 1]
            owner_candidates.append(candidate)[cite: 1]

        candidate.update({
            "assessment_status": "Completed",
            "assessment_percentage": result.get("percentage", 0),
            "assessment_score": result.get("score", 0),
            "assessment_total": result.get("total", 0),
            "assessment_completed_at": submitted_at,
            "status": "Assessment Completed",
        })[cite: 1]

        submissions = [
            x for x in (data.get("submissions", []) or [])
            if isinstance(x, dict) and str(x.get("token", "")) != token
        ][cite: 1]
        submissions.append(dict(result))[cite: 1]
        data["candidates"] = owner_candidates[cite: 1]
        data["submissions"] = submissions[cite: 1]
        _db_save_recruiter_state(owner_user_id, data)[cite: 1]
    except Exception:
        pass[cite: 1]

    return True[cite: 1]


def render_public_recruiter_assessment(token: str) -> None:
    assessment, candidate, candidate_id, owner_user_id = _find_recruiter_assessment_by_token(token)[cite: 1]
    if not assessment or not candidate:[cite: 1]
        st.error("This assessment link is invalid, expired, or no longer available.")[cite: 1]
        st.stop()[cite: 1]

    company = str(assessment.get("company") or "Company")[cite: 1]
    recruiter_name = str(assessment.get("recruiter_name") or "Recruiting Team")[cite: 1]
    recruiter_email = str(assessment.get("recruiter_email") or "")[cite: 1]
    role = str(assessment.get("role") or "Professional Assessment")[cite: 1]
    questions = assessment.get("questions", []) or [][cite: 1]
    duration_minutes = max(5, min(180, int(assessment.get("duration_minutes", 30) or 30)))[cite: 1]

    state_key = f"candidate_exam_{token[:16]}"[cite: 1]
    answers_key = f"{state_key}_answers"[cite: 1]
    started_key = f"{state_key}_started_at"[cite: 1]
    current_key = f"{state_key}_current"[cite: 1]
    review_key = f"{state_key}_review"[cite: 1]
    submitted_key = f"{state_key}_submitted"[cite: 1]

    for key, default in ((answers_key, {}), (started_key, ""), (current_key, 0), (review_key, False), (submitted_key, False)):[cite: 1]
        if key not in st.session_state:[cite: 1]
            st.session_state[key] = default[cite: 1]

    if assessment.get("used"):[cite: 1]
        st.markdown("## Assessment Already Submitted")
        st.success("This assessment has already been completed and submitted.")[cite: 1]
        st.info("This invitation cannot be used for another attempt. Please contact the recruiter if a new attempt is required.")[cite: 1]
        st.stop()[cite: 1]

    window_state = _assessment_window_state(assessment)[cite: 1]
    if window_state == "scheduled":[cite: 1]
        start = _parse_assessment_time(assessment.get("start_at"))[cite: 1]
        st.markdown("## ⏳ Assessment Not Yet Open")[cite: 1]
        st.warning(f"This assessment opens at **{start.strftime('%d %b %Y, %I:%M %p')}**." if start else "This assessment is not open yet.")[cite: 1]
        st.stop()[cite: 1]
    if window_state == "closed":[cite: 1]
        end = _parse_assessment_time(assessment.get("end_at"))[cite: 1]
        st.markdown("## Assessment Closed")
        st.error(f"The assessment access window ended at **{end.strftime('%d %b %Y, %I:%M %p')}**." if end else "The assessment access window has closed.")[cite: 1]
        st.stop()[cite: 1]

    if not questions:[cite: 1]
        st.error("This assessment currently has no questions.")[cite: 1]
        st.stop()[cite: 1]

    st.markdown(
        f"""
        <div style='padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;margin-bottom:18px;'>
            <div style='font-size:12px;font-weight:800;letter-spacing:.1em;color:#64748b;text-transform:uppercase;'>CAREERLENS AI · PRE-EMPLOYMENT ASSESSMENT</div>
            <h2 style='margin:8px 0 4px;color:#0f172a;'>{_escape(company)}</h2>
            <h4 style='margin:0;color:#334155;'>{_escape(role)}</h4>
            <p style='margin:10px 0 0;color:#64748b;font-size:0.85rem;'>Invited by <b>{_escape(recruiter_name)}</b>{(' · ' + _escape(recruiter_email)) if recruiter_email else ''}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if st.session_state[submitted_key]:[cite: 1]
        st.success("Assessment submitted successfully.")[cite: 1]
        st.markdown("### Thank you for completing the assessment")[cite: 1]
        st.write("Your responses have been securely recorded and returned to the recruiting team.")[cite: 1]
        st.info("You may close this browser tab now.")[cite: 1]
        st.stop()[cite: 1]

    if not st.session_state[started_key]:[cite: 1]
        c1, c2, c3 = st.columns(3)[cite: 1]
        c1.metric("Questions", len(questions))[cite: 1]
        c2.metric("Duration", f"{duration_minutes} min")[cite: 1]
        c3.metric("Format", "One question at a time")[cite: 1]
        start_window = _parse_assessment_time(assessment.get("start_at"))[cite: 1]
        end_window = _parse_assessment_time(assessment.get("end_at"))[cite: 1]
        if start_window or end_window:[cite: 1]
            st.info(f" Access window: **{start_window.strftime('%d %b %Y, %I:%M %p') if start_window else 'Open'}** → **{end_window.strftime('%d %b %Y, %I:%M %p') if end_window else 'No closing time'}**. Your timer starts after clicking Start.")

        st.markdown("### Before you start")[cite: 1]
        st.markdown(
            """
            - Read each question carefully and select the **single best answer**.
            - Questions appear **one at a time**; use **Previous** and **Next** to navigate.
            - Your question set and answer choices are randomized specifically for this candidate.
            - The timer starts only when you click **Start Assessment**.
            - You can review your answers before final submission.
            """
        )
        st.warning(f"⏱ You will have {duration_minutes} minutes. Make sure you have enough uninterrupted time before starting.")[cite: 1]
        if st.button("Start Assessment", icon=":material/play_arrow:", type="primary", use_container_width=True, key=f"start_public_assessment_{token[:10]}"):[cite: 1]
            st.session_state[started_key] = _now_ist().isoformat(timespec="seconds")[cite: 1]
            st.session_state[current_key] = 0[cite: 1]
            st.session_state[review_key] = False[cite: 1]
            st.rerun()[cite: 1]
        st.stop()[cite: 1]

    try:
        started_at = _as_ist(datetime.fromisoformat(st.session_state[started_key]))[cite: 1]
        deadline = started_at.timestamp() + duration_minutes * 60[cite: 1]
        remaining = max(0, int(deadline - _now_ist().timestamp()))[cite: 1]
    except (TypeError, ValueError):
        remaining = duration_minutes * 60[cite: 1]
        deadline = datetime.now().timestamp() + remaining[cite: 1]
        st.session_state[started_key] = _now_ist().isoformat(timespec="seconds")[cite: 1]

    if remaining <= 0:[cite: 1]
        result = assessment_result(questions, st.session_state[answers_key])[cite: 1]
        result.update({
            "token": token,
            "candidate_id": candidate_id,
            "candidate_name": candidate.get("name", "Candidate"),
            "candidate_email": candidate.get("email", ""),
            "role": role,
            "company": company,
            "recruiter_name": recruiter_name,
            "recruiter_email": recruiter_email,
            "assessment_id": assessment.get("id", ""),
            "submission_type": "Auto-submitted on time expiry",
        })[cite: 1]
        saved = _save_public_assessment_result(owner_user_id, assessment, candidate_id, result)[cite: 1]
        if not saved:[cite: 1]
            st.error("Your assessment could not be recorded. Please contact the recruiter before leaving this page.")[cite: 1]
            st.stop()[cite: 1]
        st.session_state["last_assessment_result"] = result[cite: 1]
        st.rerun()[cite: 1]

    mins, secs = divmod(remaining, 60)[cite: 1]
    st.markdown(
        f"""
        <div style='position:sticky;top:8px;z-index:20;padding:12px 16px;border:1px solid #cbd5e1;border-radius:12px;background:#ffffff;box-shadow:0 4px 16px rgba(15,23,42,.06);margin-bottom:18px;'>
            <div style='display:flex;justify-content:space-between;align-items:center;gap:16px;'>
                <div><b>Assessment in progress</b><div style='font-size:12px;color:#64748b;'>{len(questions)} questions · one question at a time</div></div>
                <div style='font-size:20px;font-weight:800;color:#dc2626;' id='cl-timer'>{mins:02d}:{secs:02d}</div>
            </div>
            <div style='margin-top:8px;height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden;'><div style='width:{min(100,max(0,remaining/(duration_minutes*60)*100)):.2f}%;height:100%;background:#2563eb;'></div></div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if st.session_state[review_key]:[cite: 1]
        st.markdown("### Review Your Answers")
        st.caption("Check your selections before final submission. Unanswered questions will be marked unanswered.")[cite: 1]
        answered_count = sum(1 for q in questions if st.session_state[answers_key].get(q.get("id")) is not None)[cite: 1]
        a, b, c = st.columns(3)[cite: 1]
        a.metric("Answered", answered_count)[cite: 1]
        b.metric("Unanswered", len(questions) - answered_count)[cite: 1]
        c.metric("Questions", len(questions))[cite: 1]

        for q in questions:[cite: 1]
            selected = st.session_state[answers_key].get(q.get("id"))[cite: 1]
            label = selected if selected is not None else "Not answered"[cite: 1]
            st.markdown(
                f"**Q{q.get('id')}. {_escape(q.get('question', 'Question'))}**  \n"
                f"<span style='color:#64748b;'>Your answer: {_escape(label)}</span>",
                unsafe_allow_html=True,
            )[cite: 1]

        edit_q = st.selectbox(
            "Choose a question to edit",
            options=list(range(1, len(questions) + 1)),
            format_func=lambda n: f"Question {n}",
            key=f"{state_key}_edit_question",
        )[cite: 1]
        e1, e2 = st.columns(2)[cite: 1]
        if e1.button("← Edit Selected Question", use_container_width=True, key=f"edit_review_{token[:10]}"):[cite: 1]
            st.session_state[current_key] = edit_q - 1[cite: 1]
            st.session_state[review_key] = False[cite: 1]
            st.rerun()[cite: 1]
        if e2.button("Submit Assessment", type="primary", use_container_width=True, key=f"final_submit_{token[:10]}"):
            result = assessment_result(questions, st.session_state[answers_key])[cite: 1]
            result.update({
                "token": token,
                "candidate_id": candidate_id,
                "candidate_name": candidate.get("name", "Candidate"),
                "candidate_email": candidate.get("email", ""),
                "role": role,
                "company": company,
                "recruiter_name": recruiter_name,
                "recruiter_email": recruiter_email,
                "assessment_id": assessment.get("id", ""),
                "submission_type": "Candidate submitted",
            })[cite: 1]
            saved = _save_public_assessment_result(owner_user_id, assessment, candidate_id, result)[cite: 1]
            if not saved:[cite: 1]
                st.error("Your assessment could not be recorded. Please contact the recruiter before leaving this page.")[cite: 1]
                st.stop()[cite: 1]
            st.session_state[submitted_key] = True[cite: 1]
            st.session_state["last_assessment_result"] = result[cite: 1]
            st.rerun()[cite: 1]
        st.stop()[cite: 1]

    current_idx = max(0, min(len(questions) - 1, int(st.session_state[current_key])))[cite: 1]
    q = questions[current_idx][cite: 1]
    qid = q.get("id")[cite: 1]
    current_answer = st.session_state[answers_key].get(qid)[cite: 1]

    st.progress((current_idx + 1) / len(questions), text=f"Question {current_idx + 1} of {len(questions)}")[cite: 1]
    st.markdown(
        f"""
        <div style='padding:22px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;box-shadow:0 4px 16px rgba(15,23,42,.04);'>
            <div style='font-size:12px;font-weight:800;letter-spacing:.08em;color:#2563eb;text-transform:uppercase;'>{_escape(q.get('section', 'Assessment'))}</div>
            <h3 style='margin:8px 0 0;color:#0f172a;'>Question {current_idx + 1}</h3>
            <p style='font-size:18px;line-height:1.5;color:#1e293b;margin:14px 0 0;'>{_escape(q.get('question', 'Question'))}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    options = q.get("options", []) or [][cite: 1]
    default_index = options.index(current_answer) if current_answer in options else None[cite: 1]
    selected = st.radio(
        "Select one answer",
        options,
        index=default_index,
        key=f"{state_key}_radio_{qid}",
    )[cite: 1]

    nav_left, nav_mid, nav_right = st.columns([1, 1, 1])[cite: 1]
    if nav_left.button("← Previous", disabled=current_idx == 0, use_container_width=True, key=f"prev_{token[:10]}_{qid}"):[cite: 1]
        st.session_state[answers_key][qid] = selected[cite: 1]
        st.session_state[current_key] = current_idx - 1[cite: 1]
        st.rerun()[cite: 1]

    if nav_mid.button("Review Answers", use_container_width=True, key=f"review_{token[:10]}_{qid}"):[cite: 1]
        st.session_state[answers_key][qid] = selected[cite: 1]
        st.session_state[review_key] = True[cite: 1]
        st.rerun()[cite: 1]

    next_label = "Next Question →" if current_idx < len(questions) - 1 else "Review & Submit →"[cite: 1]
    if nav_right.button(next_label, type="primary", use_container_width=True, key=f"next_{token[:10]}_{qid}"):[cite: 1]
        st.session_state[answers_key][qid] = selected[cite: 1]
        if current_idx < len(questions) - 1:[cite: 1]
            st.session_state[current_key] = current_idx + 1[cite: 1]
        else:
            st.session_state[review_key] = True[cite: 1]
        st.rerun()[cite: 1]


_assessment_query_token = ""[cite: 1]
try:
    _assessment_query_token = str(st.query_params.get("assessment", "") or "").strip()[cite: 1]
except Exception:
    _assessment_query_token = ""[cite: 1]

if _assessment_query_token:[cite: 1]
    render_public_recruiter_assessment(_assessment_query_token)[cite: 1]
    st.stop()[cite: 1]


# ============================================================
# DIALOGS (SIGN IN & REGISTER)
# ============================================================
@st.dialog("Sign In / Register")
def dialog_auth(default_tab: int = 0):
    tab_auth1, tab_auth2 = st.tabs(["Sign In", "Register"])[cite: 1]
    with tab_auth1:[cite: 1]
        u = st.text_input("Username or Email", key="auth_sign_u")[cite: 1]
        p = st.text_input("Password", type="password", key="auth_sign_p")[cite: 1]
        if st.button("Sign In", icon=":material/lock:", use_container_width=True, key="btn_confirm_sign", type="primary"):[cite: 1]
            if not u or not p:[cite: 1]
                st.warning("Please fill in both fields.")[cite: 1]
            else:
                account = _db_user(u)[cite: 1]
                if account and password_matches(account[3], p):[cite: 1]
                    st.session_state.user_id = account[0][cite: 1]
                    st.session_state.username = account[2][cite: 1]
                    st.session_state.is_logged_in = True[cite: 1]
                    st.session_state.selected_gateway = False[cite: 1]
                    saved = _db_load_state(st.session_state.user_id)[cite: 1]
                    for key, value in saved.items():[cite: 1]
                        st.session_state[key] = value[cite: 1]
                    st.session_state.recruiter_data = _db_load_recruiter_state(st.session_state.user_id)[cite: 1]
                    st.session_state.recruiter_candidates = st.session_state.recruiter_data.get("candidates", [])[cite: 1]
                    st.session_state.recruiter_assessment_submissions = {
                        x.get("token", str(i)): x
                        for i, x in enumerate(st.session_state.recruiter_data.get("submissions", []))
                        if isinstance(x, dict)
                    }[cite: 1]
                    log_event("LOGIN", st.session_state.username, "N/A", "User Login")[cite: 1]
                    st.rerun()[cite: 1]
                elif ADMIN_PIN and u.lower() == "admin" and p == ADMIN_PIN:[cite: 1]
                    st.session_state.user_id = "admin"[cite: 1]
                    st.session_state.username = "Administrator"[cite: 1]
                    st.session_state.is_logged_in = True[cite: 1]
                    st.session_state.selected_gateway = True[cite: 1]
                    st.session_state.active_workspace = "Recruiter Workspace"[cite: 1]
                    st.rerun()[cite: 1]
                else:
                    st.error("Invalid credentials. Please register or verify your details.")[cite: 1]

    with tab_auth2:[cite: 1]
        reg_n = st.text_input("Full Name", key="auth_reg_n")[cite: 1]
        reg_u = st.text_input("Choose Username / Email", key="auth_reg_u")[cite: 1]
        reg_p = st.text_input("Create Password", type="password", key="auth_reg_p")[cite: 1]
        if st.button("Create Account", icon=":material/person_add:", use_container_width=True, key="btn_confirm_reg", type="primary"):[cite: 1]
            if not reg_u or not reg_p:[cite: 1]
                st.warning("Username and password are required.")[cite: 1]
            else:
                if _db_user(reg_u):[cite: 1]
                    st.error("That username or email is already registered. Please sign in.")[cite: 1]
                else:
                    try:
                        uid = _db_create_user(reg_u, reg_n, hash_password(reg_p))[cite: 1]
                        st.session_state.user_id = uid[cite: 1]
                        st.session_state.username = reg_n.strip() if reg_n.strip() else reg_u.split("@")[0].capitalize()[cite: 1]
                        st.session_state.is_logged_in = True[cite: 1]
                        st.session_state.selected_gateway = False[cite: 1]
                        st.session_state.recruiter_data = _db_load_recruiter_state(uid)[cite: 1]
                        st.session_state.recruiter_candidates = [][cite: 1]
                        st.session_state.recruiter_assessment_submissions = {}[cite: 1]
                        _db_save_state(uid, {"username": st.session_state.username, "resume_text": "", "resume_analysis": None, "job_match_result": None, "resume_builder": {}})[cite: 1]
                        log_event("REGISTER", st.session_state.username, "N/A", f"Registered: {reg_u}")[cite: 1]
                        st.rerun()[cite: 1]
                    except sqlite3.IntegrityError:
                        st.error("That username or email is already registered. Please sign in.")[cite: 1]


# ============================================================
# 1. LANDING & ACCESS SCREEN (5-LINE ROLLING HERO TEXT)
# ============================================================
if not st.session_state.is_logged_in:[cite: 1]
    _access_action = str(st.query_params.get("access", "") or "").strip().lower()[cite: 1]

    if _access_action:[cite: 1]
        try:
            del st.query_params["access"][cite: 1]
        except Exception:
            pass[cite: 1]

        if _access_action == "signin":[cite: 1]
            dialog_auth(default_tab=0)[cite: 1]
        elif _access_action == "register":[cite: 1]
            dialog_auth(default_tab=1)[cite: 1]
        elif _access_action == "guest":[cite: 1]
            st.session_state.user_id = ""[cite: 1]
            st.session_state.username = "Guest Explorer"[cite: 1]
            st.session_state.is_logged_in = True[cite: 1]
            st.session_state.resume_text = ""[cite: 1]
            st.session_state.resume_analysis = None[cite: 1]
            st.session_state.job_match_result = None[cite: 1]
            st.session_state.resume_builder = {}[cite: 1]
            st.session_state.recruiter_data = {
                "campaign": None,
                "candidates": [],
                "assessments": [],
                "submissions": [],
            }[cite: 1]
            st.session_state.recruiter_candidates = [][cite: 1]
            st.session_state.recruiter_assessment_submissions = {}[cite: 1]
            st.session_state.selected_gateway = False[cite: 1]
            log_event("GUEST_ACCESS", "Guest", "N/A", "Guest entry")[cite: 1]
            st.rerun()[cite: 1]

    st.markdown("""
    <div class="cl-hero" role="banner" aria-label="CareerLens AI introduction">
      <div class="cl-hero-kicker">THE AI-POWERED CAREER OPERATING SYSTEM</div>
      <div class="cl-hero-title-rotator" aria-label="CareerLens AI value proposition">
        <div class="cl-hero-line">Understand your career. Build a strong future.</div>
        <div class="cl-hero-line">Turn your skills into career opportunities.</div>
        <div class="cl-hero-line">Learn smarter, grow faster, get hired.</div>
        <div class="cl-hero-line">Your career journey starts with AI.</div>
        <div class="cl-hero-line">Intelligent hiring and talent acquisition made simple.</div>
      </div>
      <div class="cl-hero-copy">
        One intelligent workspace for resume intelligence, job matching, skill-gap discovery, career roadmaps, interview practice, and recruiter intelligence — connected from first scan to hiring.
      </div>
      <div class="cl-hero-stats">
        <span class="cl-hero-chip"><span class="material-symbols-outlined">description</span>Resume Intelligence</span>
        <span class="cl-hero-chip"><span class="material-symbols-outlined">target</span>Job Matching</span>
        <span class="cl-hero-chip"><span class="material-symbols-outlined">route</span>Career Roadmaps</span>
        <span class="cl-hero-chip"><span class="material-symbols-outlined">record_voice_over</span>Interview Practice</span>
        <span class="cl-hero-chip"><span class="material-symbols-outlined">groups</span>Recruiter Intelligence</span>
      </div>
    </div>
    """, unsafe_allow_html=True)

    f1, f2, f3 = st.columns(3, gap="medium")[cite: 1]
    with f1:[cite: 1]
        st.markdown('<div class="landing-feature"><div class="landing-icon"><span class="material-symbols-outlined">psychology</span></div><div class="landing-feature-title">AI-Powered Insights</div><div class="landing-feature-text">Make data-driven career choices.</div></div>', unsafe_allow_html=True)
    with f2:[cite: 1]
        st.markdown('<div class="landing-feature"><div class="landing-icon"><span class="material-symbols-outlined">route</span></div><div class="landing-feature-title">Personalized Roadmaps</div><div class="landing-feature-text">Step-by-step guidance toward your target role.</div></div>', unsafe_allow_html=True)
    with f3:[cite: 1]
        st.markdown('<div class="landing-feature"><div class="landing-icon"><span class="material-symbols-outlined">verified_user</span></div><div class="landing-feature-title">Trusted & Secure</div><div class="landing-feature-text">Private, secure processing of candidate profiles.</div></div>', unsafe_allow_html=True)

    st.markdown('<div class="landing-access"><div class="landing-access-title">Welcome to CareerLens AI</div><div class="landing-access-copy">Sign in, create an account, or explore instantly as a guest.</div><div class="landing-divider"></div></div>', unsafe_allow_html=True)
    a1, a2, a3 = st.columns(3, gap="small")[cite: 1]
    with a1:[cite: 1]
        if st.button("Sign In", icon=":material/lock:", use_container_width=True, type="primary", key="landing_signin"):[cite: 1]
            dialog_auth(default_tab=0)[cite: 1]
    with a2:[cite: 1]
        if st.button("Register / Create Account", icon=":material/person_add:", use_container_width=True, key="landing_register"):[cite: 1]
            dialog_auth(default_tab=1)[cite: 1]
    with a3:[cite: 1]
        if st.button("Explore as Guest", icon=":material/explore:", use_container_width=True, key="landing_guest"):[cite: 1]
            st.session_state.user_id = ""[cite: 1]
            st.session_state.username = "Guest Explorer"[cite: 1]
            st.session_state.is_logged_in = True[cite: 1]
            st.session_state.resume_text = ""[cite: 1]
            st.session_state.resume_analysis = None[cite: 1]
            st.session_state.job_match_result = None[cite: 1]
            st.session_state.resume_builder = {}[cite: 1]
            st.session_state.recruiter_data = {"campaign": None, "candidates": [], "assessments": [], "submissions": []}[cite: 1]
            st.session_state.recruiter_candidates = [][cite: 1]
            st.session_state.recruiter_assessment_submissions = {}[cite: 1]
            st.session_state.selected_gateway = False[cite: 1]
            log_event("GUEST_ACCESS", "Guest", "N/A", "Guest entry")[cite: 1]
            st.rerun()[cite: 1]

    st.stop()[cite: 1]


# ============================================================
# 2. WORKSPACE GATEWAY PORTAL (ROLLING PORTAL TEXT)
# ============================================================
if not st.session_state.selected_gateway:[cite: 1]
    st.markdown(
        f"""
        <div class="header-banner">
          <div>
            <div class="header-title">Welcome, {html.escape(st.session_state.username)}!</div>
            <div class="header-sub">Choose your dedicated workspace to proceed.</div>
          </div>
          <span class="tag-badge tag-blue">CAREER INTELLIGENCE SYSTEM</span>
        </div>
        """, unsafe_allow_html=True)
    g1, g2 = st.columns(2, gap="large")[cite: 1]
    with g1:[cite: 1]
        st.markdown("""
        <div class="gateway-card">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
            <div class="role-icon"><span class="material-symbols-outlined">work</span></div>
            <div><h3 style="margin:0;font-size:1.15rem">Job Seeker Portal</h3><span class="tag-badge tag-blue">Candidate Suite</span></div>
          </div>
          <p style="color:#64748b;font-size:.85rem;line-height:1.5;margin-bottom:0;">Discover opportunities, improve core skills, and accelerate your career path with deep guidance.</p>
          <div class="cl-portal-rotator">
            <div class="cl-portal-line">• Build your career with AI-powered resume analytics.</div>
            <div class="cl-portal-line">• Uncover key skill gaps and align with job market roles.</div>
            <div class="cl-portal-line">• Prepare thoroughly using resume-aware mock interviews.</div>
            <div class="cl-portal-line">• Access real-time salary benchmarks and personalized roadmaps.</div>
          </div>
          <div style="border-top:1px solid #f1f5f9;margin-top:auto;padding-top:14px;color:#475569;font-size:.76rem;line-height:1.8">
             <span class="material-symbols-outlined">description</span> Resume Intelligence &nbsp; <span class="material-symbols-outlined">mic</span> AI Mock Interview<br><span class="material-symbols-outlined">target</span> Job Match &nbsp; <span class="material-symbols-outlined">payments</span> Salary Insights &nbsp; <span class="material-symbols-outlined">route</span> Career Roadmap
          </div>
        </div>""", unsafe_allow_html=True)
        if st.button("Continue as Job Seeker", icon=":material/arrow_forward:", key="btn_portal_seeker", use_container_width=True, type="primary"):[cite: 1]
            st.session_state.active_workspace = "Job Seeker Workspace"[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.session_state.selected_gateway = True[cite: 1]
            st.rerun()[cite: 1]
    with g2:[cite: 1]
        st.markdown("""
        <div class="gateway-card">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
            <div class="role-icon"><span class="material-symbols-outlined">groups</span></div>
            <div><h3 style="margin:0;font-size:1.15rem">Recruiter Portal</h3><span class="tag-badge tag-purple">Talent Acquisition</span></div>
          </div>
          <p style="color:#64748b;font-size:.85rem;line-height:1.5;margin-bottom:0;">Streamline hiring, screen cohorts at scale, and evaluate top candidates with targeted assessments.</p>
          <div class="cl-portal-rotator">
            <div class="cl-portal-line">• Bulk screen and rank candidate resumes using semantic matching.</div>
            <div class="cl-portal-line">• Configure role-based hiring campaigns with custom descriptions.</div>
            <div class="cl-portal-line">• Automatically dispatch randomized qualifying assessments via email.</div>
            <div class="cl-portal-line">• Track scores and submission metrics in an auditable Score Vault.</div>
          </div>
          <div style="border-top:1px solid #f1f5f9;margin-top:auto;padding-top:14px;color:#475569;font-size:.76rem;line-height:1.8">
             <span class="material-symbols-outlined">upload_file</span> Bulk Resume Screening &nbsp; <span class="material-symbols-outlined">campaign</span> Hiring Campaigns<br><span class="material-symbols-outlined">assignment</span> Assessment Dispatcher &nbsp; <span class="material-symbols-outlined">leaderboard</span> Candidate Ranking
          </div>
        </div>""", unsafe_allow_html=True)
        if st.button("Continue as Recruiter", icon=":material/arrow_forward:", key="btn_portal_recruiter", use_container_width=True, type="primary"):[cite: 1]
            st.session_state.active_workspace = "Recruiter Workspace"[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.session_state.selected_gateway = True[cite: 1]
            st.rerun()[cite: 1]
    st.stop()[cite: 1]


# ============================================================
# 3. SIDEBAR NAVIGATION (PURE WHITE BACKGROUND)
# ============================================================
with st.sidebar:[cite: 1]
    st.markdown(
        """
        <div class="sidebar-brand-box">
            <div style="width:36px;height:36px;border-radius:10px;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#ffffff;">
              <span class="material-symbols-outlined" style="font-size:22px;">work</span>
            </div>
            <div>
                <div style="font-size:1.15rem;line-height:1.1;font-weight:900;color:#0f172a;">CareerLens <span style="color:#2563eb;">AI</span></div>
                <div style="font-size:.68rem;color:#64748b;font-weight:700;">Career Intelligence System</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        f"""
        <div class="sidebar-user-box">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:34px; height:34px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; font-weight:800; border:1px solid #dbeafe;">
                    <span class="material-symbols-outlined" style="font-size:18px;">person</span>
                </div>
                <div>
                    <div style="font-size:0.86rem; font-weight:800; color:#0f172a;">{html.escape(st.session_state.username)}</div>
                    <div style="font-size:0.7rem; color:#64748b; font-weight:600;">Active Session</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown('<div class="sidebar-section-title">MAIN WORKSPACE</div>', unsafe_allow_html=True)
    is_seeker = st.session_state.active_workspace == "Job Seeker Workspace"[cite: 1]
    is_recruiter = st.session_state.active_workspace == "Recruiter Workspace"[cite: 1]

    if st.button("Job Seeker Workspace", icon=":material/person:", key="sb_ws_seeker", type="primary" if is_seeker else "secondary", use_container_width=True):[cite: 1]
        st.session_state.active_workspace = "Job Seeker Workspace"[cite: 1]
        st.session_state.active_tool = "Dashboard"[cite: 1]
        st.rerun()[cite: 1]

    if st.button("Recruiter Workspace", icon=":material/business:", key="sb_ws_recruiter", type="primary" if is_recruiter else "secondary", use_container_width=True):[cite: 1]
        st.session_state.active_workspace = "Recruiter Workspace"[cite: 1]
        st.session_state.active_tool = "Dashboard"[cite: 1]
        st.rerun()[cite: 1]

    if is_seeker:[cite: 1]
        st.markdown('<div class="sidebar-section-title">CAREER TOOLS</div>', unsafe_allow_html=True)
        seeker_tools = [
            ("Dashboard", "Dashboard", "dashboard"),
            ("Resume Intelligence", "Resume Intelligence", "description"),
            ("Pre-Interview Assessment", "Pre-Interview Assessment", "assignment"),
            ("AI Mock Interview", "AI Mock Interview", "mic"),
            ("AI Job Match", "AI Job Match", "target"),
            ("Salary Estimation", "Salary Estimation", "payments"),
            ("Career Roadmap", "Career Roadmap", "route"),
            ("Job Detection", "Real-Time Job Detection", "verified_user"),
            ("Resume Builder", "Resume Builder", "edit_document"),
            ("AI Assistant", "AI Career Assistant", "smart_toy"),
        ][cite: 1]
        for name, key_val, icon_name in seeker_tools:[cite: 1]
            is_active = st.session_state.active_tool == key_val[cite: 1]
            if st.button(name, icon=f":material/{icon_name}:", key=f"sb_tool_{key_val}", type="primary" if is_active else "secondary", use_container_width=True):[cite: 1]
                st.session_state.active_tool = key_val[cite: 1]
                st.rerun()[cite: 1]
    else:
        st.markdown('<div class="sidebar-section-title">RECRUITER TOOLS</div>', unsafe_allow_html=True)
        rec_tools = [
            ("Recruiter Dashboard", "Dashboard", "dashboard"),
            ("Hiring Campaign", "Hiring Campaign", "campaign"),
            ("Bulk Resume Screening", "Bulk Screening", "upload_file"),
            ("Shortlisted Candidates", "Shortlisted Candidates", "emoji_events"),
            ("Assessment Dispatcher", "Assessment Builder", "assignment"),
            ("Assessment Results", "Score Vault", "analytics"),
            ("Interview Pipeline", "Interview Pipeline", "mic"),
        ][cite: 1]
        for name, key_val, icon_name in rec_tools:[cite: 1]
            is_active = st.session_state.active_tool == key_val[cite: 1]
            if st.button(name, icon=f":material/{icon_name}:", key=f"sb_rec_{key_val}", type="primary" if is_active else "secondary", use_container_width=True):[cite: 1]
                recruiter_navigate(key_val)[cite: 1]
                st.rerun()[cite: 1]

    st.markdown("<hr style='border-color: #f1f5f9; margin: 20px 0;'>", unsafe_allow_html=True)

    if st.button("Logout", icon=":material/logout:", key="sb_logout_btn", use_container_width=True):[cite: 1]
        uid = st.session_state.get("user_id", "")[cite: 1]
        if uid:[cite: 1]
            try:
                _db_save_state(uid, {
                    "username": st.session_state.username,
                    "resume_text": st.session_state.get("resume_text", ""),
                    "resume_analysis": st.session_state.get("resume_analysis"),
                    "job_match_result": st.session_state.get("job_match_result"),
                    "resume_builder": st.session_state.get("resume_builder", {}),
                })[cite: 1]
            except sqlite3.Error:
                pass[cite: 1]
        for key in ["is_logged_in", "selected_gateway", "user_id"]:[cite: 1]
            st.session_state[key] = False if key != "user_id" else ""[cite: 1]
        st.session_state.username = "Guest Explorer"[cite: 1]
        st.session_state.active_workspace = "Job Seeker Workspace"[cite: 1]
        st.session_state.active_tool = "Dashboard"[cite: 1]
        st.session_state.recruiter_nav_history = ["Dashboard"][cite: 1]
        st.session_state.recruiter_nav_index = 0[cite: 1]
        st.session_state.recruiter_selected_ids = [][cite: 1]
        st.session_state.resume_text = ""[cite: 1]
        st.session_state.resume_analysis = None[cite: 1]
        st.session_state.job_match_result = None[cite: 1]
        st.session_state.resume_builder = {}[cite: 1]
        st.session_state.recruiter_data = {"campaign": None, "candidates": [], "assessments": [], "submissions": []}[cite: 1]
        st.session_state.recruiter_candidates = [][cite: 1]
        st.session_state.recruiter_assessment_submissions = {}[cite: 1]
        st.rerun()[cite: 1]


# ============================================================
# 4. TOP APP HEADER (ROLLING HEADER TICKER)
# ============================================================
workspace_label = "Job Seeker" if st.session_state.active_workspace == "Job Seeker Workspace" else "Recruiter"[cite: 1]
st.markdown(
    f"""
    <div class="cl-app-header" role="banner" aria-label="CareerLens AI header">
      <div>
        <div class="cl-app-header-title">CareerLens <span style="color:#2563eb;">AI</span></div>
        <div class="cl-app-header-sub">{workspace_label} Workspace · Connected Career & Talent System</div>
        <div class="cl-workspace-rotator">
          <div class="cl-workspace-line">⚡ AI Resume Analysis &amp; Keyword Optimization</div>
          <div class="cl-workspace-line">🎯 Targeted Job Matching &amp; Skill Identification</div>
          <div class="cl-workspace-line">🎙️ Interactive Mock Interviews with Immediate Scoring</div>
          <div class="cl-workspace-line">📈 Structured Progression Roadmaps &amp; Market Insights</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="cl-status-pill"><span class="cl-status-dot"></span> System Ready</span>
        <span style="font-size:.8rem;font-weight:700;color:#334155;">{html.escape(st.session_state.username)}</span>
      </div>
    </div>
    """, unsafe_allow_html=True)


# ============================================================
# JOB SEEKER DASHBOARD
# ============================================================
if st.session_state.active_workspace == "Job Seeker Workspace":[cite: 1]
    analysis = st.session_state.resume_analysis[cite: 1]
    resume_score_val = f"{analysis.get('resume_score')}%" if analysis and analysis.get("resume_score") else "--"[cite: 1]
    readiness_val = f"{analysis.get('readiness')}%" if analysis and analysis.get("readiness") else "--"[cite: 1]
    market_match_val = f"{st.session_state.job_match_result.get('overall')}%" if st.session_state.job_match_result else "--"[cite: 1]
    skills_count_val = f"{len(analysis.get('skills', []))} Skills" if analysis and analysis.get("skills") else "--"

    st.markdown(
        f"""
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon-badge" style="background:#eff6ff; color:#2563eb;"><span class="material-symbols-outlined">description</span></div>
                <div>
                    <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase;">Resume Score</div>
                    <div style="font-size:1.4rem; font-weight:900; color:#0f172a;">{resume_score_val}</div>
                    <span class="tag-badge tag-blue">Content Quality</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-badge" style="background:#faf5ff; color:#7c3aed;"><span class="material-symbols-outlined">monitoring</span></div>
                <div>
                    <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase;">Readiness Index</div>
                    <div style="font-size:1.4rem; font-weight:900; color:#0f172a;">{readiness_val}</div>
                    <span class="tag-badge tag-purple">Domain Ready</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-badge" style="background:#f0fdf4; color:#15803d;"><span class="material-symbols-outlined">target</span></div>
                <div>
                    <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase;">Market Match</div>
                    <div style="font-size:1.4rem; font-weight:900; color:#0f172a;">{market_match_val}</div>
                    <span class="tag-badge tag-green">Job Target</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-badge" style="background:#fffbeb; color:#b45309;"><span class="material-symbols-outlined">lightbulb</span></div>
                <div>
                    <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase;">Detected Stack</div>
                    <div style="font-size:1.4rem; font-weight:900; color:#0f172a;">{skills_count_val}</div>
                    <span class="tag-badge tag-amber">Verified Stack</span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if st.session_state.active_tool == "Dashboard":[cite: 1]
        st.markdown("<h3 style='margin-bottom:16px; font-weight:800; font-size:1.2rem; color:#0f172a;'>Career Tools Suite</h3>", unsafe_allow_html=True)
        
        c1, c2, c3, c4 = st.columns(4)[cite: 1]
        with c1:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#eff6ff; color:#2563eb;"><span class="material-symbols-outlined">description</span></div><div class="tool-title">Resume Intelligence</div><div class="tool-desc">Deep resume analysis, strengths and enhancements.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Resume Intelligence", icon=":material/description:", key="card_c1_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "Resume Intelligence"[cite: 1]
                st.rerun()[cite: 1]
        with c2:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#faf5ff; color:#7c3aed;"><span class="material-symbols-outlined">assignment</span></div><div class="tool-title">Pre-Interview Exam</div><div class="tool-desc">Standardized MCQ domain qualifying assessment.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Pre-Interview Exam", icon=":material/assignment:", key="card_c2_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "Pre-Interview Assessment"[cite: 1]
                st.rerun()[cite: 1]
        with c3:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#eff6ff; color:#0284c7;"><span class="material-symbols-outlined">mic</span></div><div class="tool-title">AI Mock Interview</div><div class="tool-desc">Sequential dynamic interview questions with scoring.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("AI Mock Interview", icon=":material/mic:", key="card_c3_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "AI Mock Interview"[cite: 1]
                st.rerun()[cite: 1]
        with c4:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#f0fdf4; color:#15803d;"><span class="material-symbols-outlined">target</span></div><div class="tool-title">AI Job Match</div><div class="tool-desc">Match profile with job postings to find skill gaps.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("AI Job Match", icon=":material/target:", key="card_c4_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "AI Job Match"[cite: 1]
                st.rerun()[cite: 1]

        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        c5, c6, c7, c8 = st.columns(4)[cite: 1]
        with c5:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#fffbeb; color:#d97706;"><span class="material-symbols-outlined">payments</span></div><div class="tool-title">Salary Estimation</div><div class="tool-desc">Accurate market compensation benchmarks.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Salary Estimation", icon=":material/payments:", key="card_c5_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "Salary Estimation"[cite: 1]
                st.rerun()[cite: 1]
        with c6:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#f0fdf4; color:#10b981;"><span class="material-symbols-outlined">route</span></div><div class="tool-title">Career Roadmap</div><div class="tool-desc">Step-by-step career progression milestones.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Career Roadmap", icon=":material/route:", key="card_c6_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "Career Roadmap"[cite: 1]
                st.rerun()[cite: 1]
        with c7:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#fef2f2; color:#ef4444;"><span class="material-symbols-outlined">shield</span></div><div class="tool-title">Job Detection</div><div class="tool-desc">Real-time scam and fake job offer detection.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Job Detection", icon=":material/verified_user:", key="card_c7_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "Real-Time Job Detection"[cite: 1]
                st.rerun()[cite: 1]
        with c8:[cite: 1]
            st.markdown("""<div class="tool-box-card"><div class="tool-icon-circle" style="background:#faf5ff; color:#8b5cf6;"><span class="material-symbols-outlined">smart_toy</span></div><div class="tool-title">Career Assistant</div><div class="tool-desc">Ask interview preparation and career questions.</div></div>""", unsafe_allow_html=True)[cite: 1]
            if st.button("Career Assistant", icon=":material/smart_toy:", key="card_c8_btn", use_container_width=True):[cite: 1]
                st.session_state.active_tool = "AI Career Assistant"[cite: 1]
                st.rerun()[cite: 1]

    # 1. RESUME INTELLIGENCE
    elif st.session_state.active_tool == "Resume Intelligence":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_res"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### Resume Intelligence")
        st.caption("Your score is calculated from the actual resume content and experience evidence.")
        target_role = st.text_input("Target Role (optional)", placeholder="e.g. AI Engineer, Data Analyst, HR Manager", key="resume_target_role")[cite: 1]
        uploaded_doc = st.file_uploader("Upload Resume File", type=["pdf", "docx", "txt"], key="resume_intelligence_upload")[cite: 1]
        if uploaded_doc and st.button("Analyze Resume", icon=":material/analytics:", use_container_width=True, type="primary", key="analyze_resume_btn"):[cite: 1]
            with st.spinner("Analyzing resume content, evidence and role alignment..."):[cite: 1]
                res = api_analyze_resume(uploaded_doc, target_role)[cite: 1]
                st.session_state.resume_analysis = res[cite: 1]
                st.session_state.resume_text = res.get("extracted_text", "")[cite: 1]
                st.success("Resume analyzed successfully.")[cite: 1]
                st.rerun()[cite: 1]
        if st.session_state.resume_analysis:[cite: 1]
            r = st.session_state.resume_analysis[cite: 1]
            score = int(r.get("resume_score", 0) or 0)[cite: 1]
            readiness = int(r.get("readiness", 0) or 0)[cite: 1]
            market = r.get("market_match")[cite: 1]
            c1, c2, c3 = st.columns(3)[cite: 1]
            c1.metric("Resume Score", f"{score}%")[cite: 1]
            c2.metric("Readiness", f"{readiness}%")[cite: 1]
            c3.metric("Market Match", f"{market}%" if market is not None else "Not assessed")[cite: 1]
            st.progress(score / 100, text=f"Resume quality: {score}%")[cite: 1]

            st.markdown("#### Candidate Profile")[cite: 1]
            st.markdown(
                f"<div class='content-box'><b>{_escape(r.get('name', 'Candidate'))}</b><br>"
                f" {_escape(r.get('email') or 'Email not detected')} &nbsp; · &nbsp; "
                f" {_escape(r.get('phone') or 'Phone not detected')} &nbsp; · &nbsp; "
                f" {_escape(r.get('experience') or 'Not detected')}</div>",
                unsafe_allow_html=True,
            )[cite: 1]

            st.markdown("#### Detected Skills")[cite: 1]
            skills = r.get("skills") or [][cite: 1]
            if skills:[cite: 1]
                st.write(", ".join(str(x) for x in skills))[cite: 1]
            else:
                st.info("No recognized skills were detected. Add explicit skill names to improve extraction.")[cite: 1]

            st.markdown("#### Score Breakdown")[cite: 1]
            breakdown = r.get("score_breakdown") or {}[cite: 1]
            labels = {
                "content_quality": "Content Quality", "section_coverage": "Section Coverage", "skills": "Skills",
                "achievement_evidence": "Achievement Evidence", "contact_completeness": "Contact Completeness",
                "target_role_alignment": "Target Role Alignment",
            }[cite: 1]
            rows = [][cite: 1]
            for key, label in labels.items():[cite: 1]
                value = breakdown.get(key)[cite: 1]
                if value is not None:[cite: 1]
                    rows.append({"Area": label, "Score": f"{float(value):.0f}%"})[cite: 1]
            if rows:[cite: 1]
                st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)[cite: 1]
            else:
                st.info("Score details are unavailable for this analysis.")[cite: 1]

            col_a, col_b = st.columns(2)[cite: 1]
            with col_a:[cite: 1]
                st.markdown("#### Strengths")[cite: 1]
                for item in r.get("strengths") or []:[cite: 1]
                    st.success(str(item))[cite: 1]
            with col_b:[cite: 1]
                st.markdown("#### Improvement Plan")[cite: 1]
                for item in r.get("recommendations") or []:[cite: 1]
                    st.warning(str(item))[cite: 1]

    # 2. PRE-INTERVIEW ASSESSMENT
    elif st.session_state.active_tool == "Pre-Interview Assessment":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_exam"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.session_state.assessment_active = False[cite: 1]
            st.session_state.assessment_review = False[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### Pre-Interview Assessment")
        if not st.session_state.assessment_active and not st.session_state.assessment_review and st.session_state.assessment_result is None:[cite: 1]
            selected_assessment_role = st.text_input("Search / Enter Any Job Role", placeholder="e.g. AI Engineer, Civil Engineer, Accountant, Product Manager", key="assessment_role_input")[cite: 1]
            question_count = st.select_slider("Number of Questions", options=list(range(10, 51, 5)), value=st.session_state.assessment_question_count, key="assessment_count_select")[cite: 1]
            st.session_state.assessment_question_count = question_count[cite: 1]
            if st.button("Start Assessment", icon=":material/play_arrow:", use_container_width=True, type="primary", key="start_assessment_new"):[cite: 1]
                role = selected_assessment_role.strip()[cite: 1]
                if len(role) < 2:[cite: 1]
                    st.warning("Enter a job role before starting the assessment.")[cite: 1]
                else:
                    st.session_state.assessment_questions = generate_assessment_questions(role, question_count)[cite: 1]
                    st.session_state.assessment_role = role[cite: 1]
                    st.session_state.assessment_answers = {}[cite: 1]
                    st.session_state.assessment_active = True[cite: 1]
                    st.session_state.assessment_review = False[cite: 1]
                    st.session_state.assessment_result = None[cite: 1]
                    st.session_state.assessment_candidate_token = f"{st.session_state.username}_{uuid.uuid4().hex[:8]}"[cite: 1]
                    st.rerun()[cite: 1]
        elif st.session_state.assessment_active and not st.session_state.assessment_review:[cite: 1]
            questions = st.session_state.assessment_questions[cite: 1]
            with st.form("exam_form"):[cite: 1]
                temp_ans = {}[cite: 1]
                for q in questions:[cite: 1]
                    qid = q["id"][cite: 1]
                    current = st.session_state.assessment_answers.get(qid)[cite: 1]
                    current_index = q["options"].index(current) if current in q["options"] else None[cite: 1]
                    temp_ans[qid] = st.radio(f"Q{qid}. {q['question']}", q["options"], index=current_index, key=f"q_choice_{qid}")[cite: 1]
                if st.form_submit_button("Review Answers Before Submit", icon=":material/preview:", use_container_width=True):[cite: 1]
                    st.session_state.assessment_answers = temp_ans[cite: 1]
                    st.session_state.assessment_review = True[cite: 1]
                    st.rerun()[cite: 1]
        elif st.session_state.assessment_review:[cite: 1]
            questions = st.session_state.assessment_questions[cite: 1]
            st.caption(f"Reviewing {len(questions)} questions for {st.session_state.assessment_role}")[cite: 1]
            for q in questions:[cite: 1]
                selected = st.session_state.assessment_answers.get(q["id"])[cite: 1]
                status = "Answered" if selected else "Unanswered"[cite: 1]
                st.markdown(f"**Q{q['id']} — {status}**  \n{_escape(q['question'])}  \nYour answer: **{_escape(selected or 'None')}**")[cite: 1]
            b1, b2 = st.columns(2)[cite: 1]
            with b1:[cite: 1]
                if st.button("Continue Editing", icon=":material/arrow_back:", use_container_width=True, key="continue_edit_exam"):[cite: 1]
                    st.session_state.assessment_review = False[cite: 1]
                    st.rerun()[cite: 1]
            with b2:[cite: 1]
                if st.button("Submit Assessment", icon=":material/check_circle:", type="primary", use_container_width=True, key="confirm_submit_exam"):[cite: 1]
                    st.session_state.assessment_result = assessment_result(questions, st.session_state.assessment_answers)[cite: 1]
                    st.session_state.assessment_active = False[cite: 1]
                    st.session_state.assessment_review = False[cite: 1]
                    log_event("ASSESSMENT_COMPLETED", st.session_state.username, str(st.session_state.assessment_result["percentage"]), st.session_state.assessment_role)[cite: 1]
                    st.rerun()[cite: 1]
        elif st.session_state.assessment_result is not None:[cite: 1]
            result = st.session_state.assessment_result[cite: 1]
            pct = result["percentage"][cite: 1]
            st.markdown(f"<div class='content-box' style='text-align:center;padding:36px;'><div style='font-size:3rem;font-weight:900;color:#2563eb;'>{pct}%</div><p style='color:#64748b;'>{_escape(st.session_state.assessment_role)} • Score: {result['score']}/{result['total']}</p></div>", unsafe_allow_html=True)[cite: 1]
            if st.button("Take Another Assessment", icon=":material/refresh:", use_container_width=True, key="btn_reset_exam"):[cite: 1]
                st.session_state.assessment_result = None[cite: 1]
                st.session_state.assessment_answers = {}[cite: 1]
                st.rerun()[cite: 1]

    # 3. AI MOCK INTERVIEW
    elif st.session_state.active_tool == "AI Mock Interview":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_mock"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### AI Mock Interview")
        st.caption("A realistic conversational interview based on your resume. The session proceeds dynamically until you decide to finish.")
        if not st.session_state.interview_active and not st.session_state.interview_completed:[cite: 1]
            if not st.session_state.resume_text:[cite: 1]
                st.info("Tip: upload your resume in Resume Intelligence first for profile-tailored interview questions.")
            target_interview_role = st.text_input("Target Role", placeholder="e.g. AI Engineer, Product Manager, Accountant", key="mock_role_input")[cite: 1]
            company_name = st.text_input("Company (optional)", placeholder="e.g. TCS, Microsoft, Deloitte", key="mock_company_input")[cite: 1]
            max_questions = st.select_slider("Interview question bank", options=list(range(20, 51, 5)), value=30, key="mock_count_select")[cite: 1]
            if st.button("Start Interview", icon=":material/play_arrow:", use_container_width=True, type="primary", key="start_mock_new"):[cite: 1]
                role = target_interview_role.strip()[cite: 1]
                if len(role) < 2:[cite: 1]
                    st.warning("Enter a job role before starting the interview.")[cite: 1]
                else:
                    bank = generate_mock_interview_questions(role, max_questions, st.session_state.resume_text, company_name)[cite: 1]
                    st.session_state.interview_questions = bank[cite: 1]
                    st.session_state.interview_role = role[cite: 1]
                    st.session_state.interview_company = company_name.strip()[cite: 1]
                    st.session_state.interview_q_count = max_questions[cite: 1]
                    st.session_state.interview_current_idx = 0[cite: 1]
                    st.session_state.interview_transcript = [][cite: 1]
                    st.session_state.interview_active = True[cite: 1]
                    st.session_state.interview_completed = False[cite: 1]
                    st.session_state.interview_report = None[cite: 1]
                    st.rerun()[cite: 1]
        elif st.session_state.interview_active and not st.session_state.interview_completed:[cite: 1]
            transcript = st.session_state.interview_transcript[cite: 1]
            if st.session_state.interview_current_idx == 0 and not transcript:[cite: 1]
                curr_question_text = st.session_state.interview_questions[0][cite: 1]
            else:
                curr_question_text = generate_next_interview_question(
                    st.session_state.interview_role,
                    st.session_state.resume_text,
                    transcript,
                    st.session_state.interview_questions,
                )[cite: 1]
            st.session_state.interview_current_question = curr_question_text[cite: 1]
            question_no = len(transcript) + 1[cite: 1]
            st.progress(min(1.0, question_no / max(20, st.session_state.interview_q_count)), text=f"Question {question_no} · ongoing interview")[cite: 1]
            st.markdown(
                f"<div class='content-box'><span class='tag-badge tag-blue'>LIVE INTERVIEW · Q{question_no}</span>"
                f"<h3 style='margin-top:10px;color:#0f172a;'>{_escape(curr_question_text)}</h3>"
                f"<p style='color:#64748b;margin-bottom:0;'>Answer naturally. The next question can follow up on your previous answer.</p></div>",
                unsafe_allow_html=True,
            )[cite: 1]
            cand_response = st.text_area("Your response", height=190, key=f"ans_text_live_{question_no}")[cite: 1]
            next_col, stop_col = st.columns(2)[cite: 1]
            with next_col:[cite: 1]
                if st.button("Submit Answer & Continue", icon=":material/arrow_forward:", use_container_width=True, type="primary", key=f"mock_next_live_{question_no}"):[cite: 1]
                    if not cand_response.strip():[cite: 1]
                        st.warning("Please answer the current question before continuing.")[cite: 1]
                    else:
                        st.session_state.interview_transcript.append({"question": curr_question_text, "answer": cand_response.strip()})[cite: 1]
                        st.session_state.interview_current_idx += 1[cite: 1]
                        st.rerun()[cite: 1]
            with stop_col:[cite: 1]
                if st.button("Stop Interview & Show Score", icon=":material/stop:", use_container_width=True, key=f"mock_stop_live_{question_no}"):[cite: 1]
                    if cand_response.strip():[cite: 1]
                        st.session_state.interview_transcript.append({"question": curr_question_text, "answer": cand_response.strip()})[cite: 1]
                    if not st.session_state.interview_transcript:[cite: 1]
                        st.warning("Answer at least one question before stopping the interview.")[cite: 1]
                    else:
                        st.session_state.interview_active = False[cite: 1]
                        st.session_state.interview_completed = True[cite: 1]
                        st.session_state.interview_report = score_mock_interview(st.session_state.interview_transcript, st.session_state.interview_role)[cite: 1]
                        log_event("MOCK_INTERVIEW_COMPLETED", st.session_state.username, str(st.session_state.interview_report.get("overall", 0)), st.session_state.interview_role)[cite: 1]
                        st.rerun()[cite: 1]
        elif st.session_state.interview_completed:[cite: 1]
            rep = st.session_state.interview_report or {}[cite: 1]
            st.markdown(f"<div class='content-box' style='text-align:center;'><div class='tag-badge tag-blue'>INTERVIEW COMPLETE</div><h2>Interview Score: <span style='color:#2563eb;'>{rep.get('overall', 0)}%</span></h2><p>{_escape(st.session_state.interview_role)}{(' · ' + _escape(st.session_state.interview_company)) if st.session_state.interview_company else ''}</p></div>", unsafe_allow_html=True)[cite: 1]
            a, b, c, d = st.columns(4)[cite: 1]
            a.metric("Overall", f"{rep.get('overall', 0)}%")[cite: 1]
            b.metric("Communication", f"{rep.get('communication', 0)}%")[cite: 1]
            c.metric("Evidence", f"{rep.get('evidence', 0)}%")[cite: 1]
            d.metric("Relevance", f"{rep.get('relevance', 0)}%")[cite: 1]
            st.markdown("#### Interview Feedback")[cite: 1]
            for item in rep.get("strengths", []): st.success(str(item))[cite: 1]
            for item in rep.get("improvements", []): st.warning(str(item))[cite: 1]
            with st.expander("View Interview Transcript"):[cite: 1]
                for i, item in enumerate(st.session_state.interview_transcript, 1):[cite: 1]
                    st.markdown(f"**Q{i}.** {_escape(item.get('question',''))}")[cite: 1]
                    st.markdown(f"**Your answer:** {_escape(item.get('answer',''))}")[cite: 1]
                    st.divider()[cite: 1]
            if st.button("Start Another Mock Interview", icon=":material/refresh:", key="btn_retry_mock"):[cite: 1]
                st.session_state.interview_completed = False[cite: 1]
                st.session_state.interview_active = False[cite: 1]
                st.session_state.interview_report = None[cite: 1]
                st.session_state.interview_transcript = [][cite: 1]
                st.rerun()[cite: 1]

    # 4. AI JOB MATCH
    elif st.session_state.active_tool == "AI Job Match":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_jm"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### AI Job Match")
        st.caption("Compare your resume against any job description to uncover matching skills and priority gaps.")
        jd_text = st.text_area("Paste Job Description", height=220, placeholder="Paste the complete job description here…", key="job_match_jd")[cite: 1]
        if st.button("Analyze Job Match", icon=":material/search:", use_container_width=True, type="primary", key="analyze_job_match"):[cite: 1]
            if not st.session_state.resume_text:[cite: 1]
                st.warning("Upload your resume in Resume Intelligence first.")[cite: 1]
            elif not jd_text.strip():[cite: 1]
                st.warning("Paste a job description first.")[cite: 1]
            else:
                with st.spinner("Comparing resume evidence, skills and job requirements…"):[cite: 1]
                    st.session_state.job_match_result = normalize_job_match(api_match_job(st.session_state.resume_text, jd_text))[cite: 1]
                    st.rerun()[cite: 1]
        if st.session_state.job_match_result:[cite: 1]
            m = st.session_state.job_match_result[cite: 1]
            score = int(m.get("overall", 0) or 0)[cite: 1]
            st.markdown(f"<div class='content-box' style='text-align:center;'><div style='font-size:.75rem;font-weight:800;color:#64748b;text-transform:uppercase;'>Overall Job Match</div><div style='font-size:3rem;font-weight:900;color:#2563eb;'>{score}%</div><p style='color:#64748b;margin:0;'>{_escape(m.get('summary',''))}</p></div>", unsafe_allow_html=True)[cite: 1]
            a, b, c, d = st.columns(4)[cite: 1]
            a.metric("Match Score", f"{score}%")[cite: 1]
            b.metric("Semantic Similarity", f"{float(m.get('semantic_similarity', 0) or 0):.1f}%")[cite: 1]
            c.metric("Matched Skills", len(m.get("matched", [])))[cite: 1]
            d.metric("Skill Gaps", len(m.get("missing", [])))[cite: 1]
            t1, t2, t3 = st.columns(3)[cite: 1]
            with t1:[cite: 1]
                st.markdown("#### Matched Skills")
                matched = m.get("matched", []) or [][cite: 1]
                if matched:[cite: 1]
                    st.dataframe(pd.DataFrame({"Matched Skill": matched}), use_container_width=True, hide_index=True)[cite: 1]
                else:
                    st.info("No explicit matching skills detected.")[cite: 1]
            with t2:[cite: 1]
                st.markdown("#### Skills to Upgrade")
                missing = m.get("missing", []) or [][cite: 1]
                if missing:[cite: 1]
                    st.dataframe(pd.DataFrame({"Skill Gap": missing}), use_container_width=True, hide_index=True)[cite: 1]
                else:
                    st.success("No major explicit skill gaps detected.")[cite: 1]
            with t3:[cite: 1]
                st.markdown("#### Recommended Skills")
                recommended = m.get("recommended_skills", missing[:10]) or [][cite: 1]
                if recommended:[cite: 1]
                    st.dataframe(pd.DataFrame({"Recommended Skill": recommended}), use_container_width=True, hide_index=True)[cite: 1]
                else:
                    st.success("No additional priority skills identified.")[cite: 1]
            st.markdown(f"**Experience Alignment:** {m.get('experience_alignment', 'Unavailable')}")[cite: 1]

    # 5. SALARY ESTIMATION
    elif st.session_state.active_tool == "Salary Estimation":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_sal"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### Salary Estimation")
        sal_role_in = st.text_input("Role Title", placeholder="e.g. AI Engineer, Accountant, Civil Engineer", key="salary_role")[cite: 1]
        sal_exp_in = st.selectbox("Experience Level", ["Entry Level (0-2 yrs)", "Mid Level (3-5 yrs)", "Senior Level (6-10 yrs)", "Lead / Manager (10+ yrs)"], key="salary_exp")[cite: 1]
        sal_location = st.text_input("Location", value="India", key="salary_location")[cite: 1]
        if st.button("Estimate Compensation", icon=":material/payments:", use_container_width=True, type="primary", key="salary_btn"):[cite: 1]
            if not sal_role_in.strip():[cite: 1]
                st.warning("Enter a role title.")[cite: 1]
            else:
                result = api_salary_estimate(sal_role_in.strip(), sal_exp_in, sal_location.strip() or "India")[cite: 1]
                st.session_state.salary_result = result[cite: 1]
        if st.session_state.get("salary_result"):[cite: 1]
            sr = st.session_state.salary_result[cite: 1]
            st.markdown(f"<div class='content-box'><h2 style='margin:0;color:#2563eb;'>₹{sr.get('min_lpa',0):.1f} – ₹{sr.get('max_lpa',0):.1f} LPA</h2><p style='margin:8px 0 0;color:#64748b;'>{_escape(sr.get('role',''))} · {_escape(sr.get('experience',''))} · {_escape(sr.get('location',''))}</p></div>", unsafe_allow_html=True)[cite: 1]
            st.info(sr.get("note", "Indicative estimate; verify against current market listings."))[cite: 1]

    # 6. CAREER ROADMAP
    elif st.session_state.active_tool == "Career Roadmap":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_road"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### Career Roadmap")
        target_goal = st.text_input("Target Dream Role:", "Lead AI Architect")[cite: 1]
        if st.button("Generate Step-by-Step Plan", icon=":material/route:", use_container_width=True, type="primary"):[cite: 1]
            with st.spinner("Generating milestones..."):[cite: 1]
                res = api_career_roadmap(st.session_state.resume_text, target_goal)[cite: 1]
                for step in res.get("steps", []):[cite: 1]
                    st.markdown(f'<div class="content-box" style="padding:16px; margin-bottom:12px;">{html.escape(step)}</div>', unsafe_allow_html=True)[cite: 1]

    # 7. REAL-TIME JOB DETECTION
    elif st.session_state.active_tool == "Real-Time Job Detection":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_det"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### Job Detection")
        st.caption("Identify red flags, payment demands, and irregular recruitment patterns in postings or offer letters.")
        job_url = st.text_input("Job / Offer Link", placeholder="https://example.com/jobs/…", key="fraud_url")[cite: 1]
        description_input = st.text_area("Job Description", height=240, placeholder="Paste the job description here…", key="fraud_description")[cite: 1]
        if st.button("Analyze Job", icon=":material/search:", use_container_width=True, type="primary", key="analyze_job_safety_new"):[cite: 1]
            if not job_url.strip() and not description_input.strip():[cite: 1]
                st.warning("Provide a job link or job description before analyzing.")[cite: 1]
            else:
                try:
                    with st.spinner("Analyzing job safety signals…"):[cite: 1]
                        parts = [][cite: 1]
                        if job_url.strip(): parts.append(fetch_public_job_url(job_url.strip()))[cite: 1]
                        if description_input.strip(): parts.append(description_input.strip())[cite: 1]
                        st.session_state.job_detection_result = api_detect_fraud("\n".join(parts))[cite: 1]
                        st.rerun()[cite: 1]
                except Exception as exc:
                    st.error(str(exc))[cite: 1]
        if st.session_state.job_detection_result:[cite: 1]
            res = st.session_state.job_detection_result[cite: 1]
            st.metric("Fraud Risk Score", f"{res.get('score', 0)}/100")[cite: 1]
            st.markdown(f"**Risk Level:** {res.get('level','UNKNOWN')}")[cite: 1]
            for signal in res.get("signal_details", []): st.warning(str(signal))[cite: 1]
            if not res.get("signal_details"): st.success("No obvious high-risk signals were detected by the current rule set.")

    # 8. RESUME BUILDER
    elif st.session_state.active_tool == "Resume Builder":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_bld"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]

        st.markdown("### Professional Live Resume Builder")
        templates = [
            "Executive", "Minimal", "Modern Blue", "Modern Purple", "Emerald", "Professional",
            "Tech", "ATS Classic", "Classic Serif", "Corporate", "Clean Grid", "Modern ATS",
            "Creative", "Elegant", "Compact", "Bold Header",
        ][cite: 1]
        previous_template = st.session_state.get("resume_template", "Executive")[cite: 1]
        default_index = templates.index(previous_template) if previous_template in templates else 0[cite: 1]
        template = st.selectbox(
            "Choose Resume Template",
            templates,
            index=default_index,
            key="resume_template_select",
        )[cite: 1]
        if template != previous_template:[cite: 1]
            st.session_state.resume_template = template[cite: 1]
            st.session_state.pop("resume_pdf_bytes", None)[cite: 1]
            st.session_state.pop("resume_pdf_template", None)[cite: 1]
        else:
            st.session_state.resume_template = template[cite: 1]

        existing = st.session_state.get("resume_builder") or {}[cite: 1]
        left, right = st.columns([1, 1], gap="large")[cite: 1]

        with left:[cite: 1]
            st.markdown("#### Edit Content")
            rb_name = st.text_input("Full Name", value=existing.get("name", ""), key="rb_name")[cite: 1]
            rb_email = st.text_input("Email", value=existing.get("email", ""), key="rb_email")[cite: 1]
            rb_phone = st.text_input("Phone", value=existing.get("phone", ""), key="rb_phone")[cite: 1]
            rb_location = st.text_input("Location", value=existing.get("location", ""), key="rb_location")[cite: 1]
            rb_linkedin = st.text_input("LinkedIn", value=existing.get("linkedin", ""), key="rb_linkedin")[cite: 1]
            rb_github = st.text_input("GitHub / Portfolio", value=existing.get("github", ""), key="rb_github")[cite: 1]
            rb_headline = st.text_input("Professional Headline", value=existing.get("headline", ""), key="rb_headline")[cite: 1]
            rb_summary = st.text_area("Professional Summary", value=existing.get("summary", ""), height=110, key="rb_summary")[cite: 1]
            rb_experience = st.text_area("Experience", value=existing.get("experience", ""), height=130, key="rb_experience")[cite: 1]
            rb_education = st.text_area("Education", value=existing.get("education", ""), height=90, key="rb_education")[cite: 1]
            rb_projects = st.text_area("Projects", value=existing.get("projects", ""), height=110, key="rb_projects")[cite: 1]
            rb_skills = st.text_area("Skills (comma-separated)", value=existing.get("skills", ""), height=80, key="rb_skills")[cite: 1]
            rb_cert = st.text_area("Certifications", value=existing.get("certifications", ""), height=70, key="rb_cert")[cite: 1]
            rb_ach = st.text_area("Achievements", value=existing.get("achievements", ""), height=70, key="rb_ach")[cite: 1]

            resume_data = {
                "name": rb_name, "email": rb_email, "phone": rb_phone, "location": rb_location,
                "linkedin": rb_linkedin, "github": rb_github, "headline": rb_headline,
                "summary": rb_summary, "experience": rb_experience, "education": rb_education,
                "projects": rb_projects, "skills": rb_skills, "certifications": rb_cert,
                "achievements": rb_ach,
            }[cite: 1]
            st.session_state.resume_builder = resume_data[cite: 1]

            if st.button("Generate & Download PDF", icon=":material/download:", use_container_width=True, type="primary", key="download_live_resume"):[cite: 1]
                pdf_bytes = build_resume_pdf(resume_data, template)[cite: 1]
                st.session_state["resume_pdf_bytes"] = pdf_bytes[cite: 1]
                st.session_state["resume_pdf_template"] = template[cite: 1]

            if st.session_state.get("resume_pdf_bytes"):[cite: 1]
                st.download_button(
                    "Download Resume PDF",
                    data=st.session_state["resume_pdf_bytes"],
                    file_name=f"CareerLens_Resume_{template.replace(' ', '_')}.pdf",
                    mime="application/pdf",
                    use_container_width=True,
                    key="download_resume_file",
                )[cite: 1]

        with right:[cite: 1]
            st.markdown(f"#### Live Preview — {template}")
            contact = " · ".join([x for x in (rb_email, rb_phone, rb_location, rb_linkedin, rb_github) if x])[cite: 1]
            preview = f"""
            <div style='background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:26px;box-shadow:0 4px 16px rgba(15,23,42,.05);'>
              <h2 style='margin:0;color:#2563eb;font-size:24px;'>{_escape(rb_name or 'Your Name')}</h2>
              <div style='font-size:12px;color:#64748b;margin:4px 0 10px;'>{_escape(contact)}</div>
              <div style='font-weight:700;color:#0f172a;font-size:14px;'>{_escape(rb_headline)}</div>
              <hr style='border:0;border-top:1px solid #e2e8f0;margin:14px 0;'>
              <div style='font-size:13px;color:#334155;line-height:1.6;'>{_escape(rb_summary).replace(chr(10), '<br>')}</div>
            </div>
            """
            st.markdown(preview, unsafe_allow_html=True)

    # 9. AI CAREER ASSISTANT
    elif st.session_state.active_tool == "AI Career Assistant":[cite: 1]
        if st.button("Back to Dashboard", icon=":material/arrow_back:", key="btn_back_ast"):[cite: 1]
            st.session_state.active_tool = "Dashboard"[cite: 1]
            st.rerun()[cite: 1]
        st.markdown("### AI Career Assistant")
        st.caption("Ask questions about your resume, roadmap, interview strategies, or industry skills.")
        if "assistant_messages" not in st.session_state:[cite: 1]
            st.session_state.assistant_messages = [][cite: 1]
        for msg in st.session_state.assistant_messages:[cite: 1]
            with st.chat_message(msg["role"]):[cite: 1]
                st.markdown(msg["content"])[cite: 1]
        prompt = st.chat_input("Ask anything about your career…", key="career_assistant_input")[cite: 1]
        if prompt:[cite: 1]
            st.session_state.assistant_messages.append({"role": "user", "content": prompt})[cite: 1]
            with st.spinner("CareerLens is thinking…"):[cite: 1]
                answer = api_chat_assistant(st.session_state.assistant_messages, resume_context=st.session_state.resume_text)[cite: 1]
            st.session_state.assistant_messages.append({"role": "assistant", "content": answer})[cite: 1]
            st.rerun()[cite: 1]
        if st.session_state.assistant_messages and st.button("Clear Chat", icon=":material/delete_sweep:", key="clear_assistant_chat"):[cite: 1]
            st.session_state.assistant_messages = [][cite: 1]
            st.rerun()[cite: 1]


# ============================================================
# RECRUITER WORKSPACE
# ============================================================
elif st.session_state.active_workspace == "Recruiter Workspace":[cite: 1]
    if st.session_state.get("user_id"):[cite: 1]
        try:
            st.session_state.recruiter_data = _db_load_recruiter_state(st.session_state.user_id)[cite: 1]
            st.session_state.recruiter_candidates = st.session_state.recruiter_data.get("candidates", [])[cite: 1]
            st.session_state.recruiter_assessment_submissions = {
                x.get("token", str(i)): x for i, x in enumerate(st.session_state.recruiter_data.get("submissions", [])) if isinstance(x, dict)
            }[cite: 1]
        except Exception:
            pass[cite: 1]
    data = st.session_state.recruiter_data[cite: 1]
    candidates = st.session_state.recruiter_candidates[cite: 1]
    submissions = list(st.session_state.recruiter_assessment_submissions.values())[cite: 1]
    campaign = data.get("campaign") or {}[cite: 1]

    def persist_recruiter():
        data["candidates"] = st.session_state.recruiter_candidates[cite: 1]
        data["submissions"] = list(st.session_state.recruiter_assessment_submissions.values())[cite: 1]
        st.session_state.recruiter_data = data[cite: 1]
        _save_recruiter_data(data)[cite: 1]

    if st.session_state.active_tool not in RECRUITER_TOOLS:[cite: 1]
        recruiter_navigate("Dashboard", record_history=False)[cite: 1]

    nav_index = int(st.session_state.get("recruiter_nav_index", 0))[cite: 1]
    nav_history = st.session_state.get("recruiter_nav_history", ["Dashboard"])[cite: 1]
    can_back = nav_index > 0[cite: 1]
    can_forward = nav_index < len(nav_history) - 1[cite: 1]

    nav1, nav2, nav3, nav4 = st.columns([0.8, 0.8, 3.6, 1.2])[cite: 1]
    with nav1:[cite: 1]
        if st.button("← Back", icon=":material/arrow_back:", disabled=not can_back, use_container_width=True, key="rec_back_btn"):[cite: 1]
            recruiter_go_back()[cite: 1]
            st.rerun()[cite: 1]
    with nav2:[cite: 1]
        if st.button("Forward →", icon=":material/arrow_forward:", disabled=not can_forward, use_container_width=True, key="rec_forward_btn"):[cite: 1]
            recruiter_go_forward()[cite: 1]
            st.rerun()[cite: 1]
    with nav3:[cite: 1]
        st.caption(f"Recruiter workflow • {st.session_state.active_tool}")[cite: 1]
    with nav4:[cite: 1]
        if st.button("Dashboard", icon=":material/dashboard:", use_container_width=True, key="rec_home_btn"):[cite: 1]
            recruiter_navigate("Dashboard")[cite: 1]
            st.rerun()[cite: 1]

    if st.session_state.active_tool == "Dashboard":[cite: 1]
        st.markdown("### Recruiter Dashboard")
        company_dash = campaign.get("company") or "Company not configured"[cite: 1]
        recruiter_dash = campaign.get("recruiter_name") or st.session_state.get("username", "Recruiter")[cite: 1]
        recruiter_email_dash = campaign.get("recruiter_email") or "Contact email not configured"[cite: 1]
        role_dash = campaign.get("role") or "Role not configured"[cite: 1]
        st.markdown(f"""<div class="recruiter-command"><div class="recruiter-command-icon"><span class="material-symbols-outlined">campaign</span></div><div><div class="recruiter-command-title">{html.escape(company_dash)}</div><div class="recruiter-command-copy"><b>Recruiter:</b> {html.escape(recruiter_dash)} &nbsp; · &nbsp; <b>Contact:</b> {html.escape(recruiter_email_dash)} &nbsp; · &nbsp; <b>Hiring:</b> {html.escape(role_dash)}</div></div></div>""", unsafe_allow_html=True)
        k1, k2, k3, k4 = st.columns(4)[cite: 1]
        k1.metric("Candidates Screened", len(candidates))[cite: 1]
        k2.metric("Shortlisted", sum(1 for c in candidates if c.get("status") == "Shortlisted"))[cite: 1]
        k3.metric("Assessments Sent", sum(1 for c in candidates if c.get("assessment_status") == "Sent"))[cite: 1]
        k4.metric("Completed Assessments", len(submissions))[cite: 1]
        st.markdown("#### Actions")[cite: 1]
        c1, c2, c3 = st.columns(3)[cite: 1]
        if c1.button("Setup Campaign", use_container_width=True, key="rec_action_campaign"):
            recruiter_navigate("Hiring Campaign")[cite: 1]
            st.rerun()[cite: 1]
        if c2.button("Screen Resumes", use_container_width=True, key="rec_action_screen"):
            recruiter_navigate("Bulk Screening")[cite: 1]
            st.rerun()[cite: 1]
        if c3.button("Dispatch Assessments", use_container_width=True, key="rec_action_dispatch"):
            recruiter_navigate("Assessment Builder")[cite: 1]
            st.rerun()[cite: 1]

    elif st.session_state.active_tool == "Hiring Campaign":[cite: 1]
        st.markdown("### Hiring Campaign")
        st.markdown("#### Employer & Recruiter Details")
        st.caption("These details identify who is hiring and appear on all candidate assessment portals.")

        c1, c2 = st.columns(2)[cite: 1]
        with c1:[cite: 1]
            company_name = st.text_input(
                "Company / Organization *",
                value=str(campaign.get("company", "")),
                placeholder="e.g. Microsoft, TCS, Deloitte",
                key="campaign_company_v6",
            )[cite: 1]
        with c2:[cite: 1]
            recruiter_name = st.text_input(
                "Recruiter / Hiring Manager *",
                value=str(campaign.get("recruiter_name", "")),
                placeholder="e.g. Priya Sharma",
                key="campaign_recruiter_name_v6",
            )[cite: 1]
        recruiter_email = st.text_input(
            "Recruiter Contact Email *",
            value=str(campaign.get("recruiter_email", "")),
            placeholder="recruiter@company.com",
            key="campaign_recruiter_email_v6",
        )[cite: 1]

        st.markdown("#### Job & Assessment Details")
        role_options = IT_ROLES + NON_IT_ROLES[cite: 1]
        saved_role = campaign.get("role", role_options[0])[cite: 1]
        role_index = role_options.index(saved_role) if saved_role in role_options else 0[cite: 1]
        role = st.selectbox("Target Role *", role_options, index=role_index, key="campaign_role_v6")[cite: 1]
        job_description = st.text_area(
            "Job Description / Assessment Context *",
            value=str(campaign.get("job_description", "")),
            height=190,
            key="campaign_job_description_v6",
            placeholder="Responsibilities, required skills, qualifications, and context…",
        )[cite: 1]

        missing = [][cite: 1]
        if not company_name.strip(): missing.append("Company / Organization")[cite: 1]
        if not recruiter_name.strip(): missing.append("Recruiter / Hiring Manager")[cite: 1]
        if not recruiter_email.strip(): missing.append("Recruiter Contact Email")[cite: 1]
        if not job_description.strip(): missing.append("Job Description")[cite: 1]

        if st.button("Save Hiring Campaign", icon=":material/save:", type="primary", use_container_width=True, key="save_campaign_v6"):[cite: 1]
            if missing:[cite: 1]
                st.error("Please complete: " + ", ".join(missing) + ".")[cite: 1]
            elif not EMAIL_RE.fullmatch(recruiter_email.strip()):[cite: 1]
                st.error("Please enter a valid recruiter contact email.")[cite: 1]
            else:
                data["campaign"] = {
                    "role": role,
                    "company": company_name.strip(),
                    "recruiter_name": recruiter_name.strip(),
                    "recruiter_email": recruiter_email.strip().lower(),
                    "job_description": job_description.strip(),
                }[cite: 1]
                persist_recruiter()[cite: 1]
                st.success(f"Campaign saved: {company_name.strip()} • {role}")[cite: 1]

    elif st.session_state.active_tool == "Bulk Screening":[cite: 1]
        st.markdown("### Bulk Resume Screening")
        st.caption("Screen multiple profiles against the active campaign job description.")
        files = st.file_uploader(
            "Upload candidate resumes",
            type=["pdf", "docx", "txt"],
            accept_multiple_files=True,
            key="recruiter_bulk_files",
        )[cite: 1]
        if files and st.button("Screen All Resumes", icon=":material/bolt:", type="primary", use_container_width=True, key="screen_all_resumes"):[cite: 1]
            campaign_jd = campaign.get("job_description", "")[cite: 1]
            if not campaign_jd.strip():[cite: 1]
                st.warning("Save a hiring campaign with a job description before screening resumes.")
            else:
                processed = [][cite: 1]
                with st.spinner(f"Screening {len(files)} resume(s)…"):[cite: 1]
                    for f in files:[cite: 1]
                        try:
                            profile = api_analyze_resume(f)[cite: 1]
                            r_text = profile.get("extracted_text", "")[cite: 1]
                            match = normalize_job_match(api_match_job(r_text, campaign_jd))[cite: 1]
                            email = (profile.get("email") or extract_email_from_text(r_text) or "").strip().lower()[cite: 1]
                            phone = (profile.get("phone") or extract_phone_from_text(r_text) or "").strip()[cite: 1]
                            name = profile.get("name") or Path(f.name).stem.replace("_", " ").replace("-", " ").title()[cite: 1]
                            processed.append({
                                "id": uuid.uuid4().hex[:16],
                                "name": name,
                                "email": email,
                                "phone": phone,
                                "resume_score": profile.get("resume_score", 0),
                                "role_match": match.get("overall", 0),
                                "status": "Screened",
                                "assessment_status": "Not Sent",
                                "email_status": "Found" if email else "Missing",
                                "skills": profile.get("skills", []),
                                "missing_skills": match.get("missing", []),
                                "source_file": f.name,
                            })[cite: 1]
                        except Exception as exc:
                            st.warning(f"Could not process {f.name}: {exc}")[cite: 1]
                processed = dedupe_candidates(processed)[cite: 1]
                processed.sort(key=lambda c: float(c.get("role_match", 0)), reverse=True)[cite: 1]
                st.session_state.recruiter_candidates = processed[cite: 1]
                st.session_state.recruiter_selected_ids = [][cite: 1]
                persist_recruiter()[cite: 1]
                st.success(f"Screened {len(processed)} unique candidate(s).")[cite: 1]
                st.rerun()[cite: 1]

        candidates = st.session_state.recruiter_candidates[cite: 1]
        if candidates:[cite: 1]
            selected_ids = set(st.session_state.get("recruiter_selected_ids", []))[cite: 1]
            st.markdown("#### Candidate Selection")[cite: 1]
            a1, a2, a3, a4 = st.columns(4)[cite: 1]
            if a1.button("Select All", use_container_width=True, key="select_all_candidates"):[cite: 1]
                st.session_state.recruiter_selected_ids = [c.get("id") for c in candidates if c.get("id")][cite: 1]
                st.rerun()[cite: 1]
            if a2.button("Clear Selection", use_container_width=True, key="clear_candidate_selection"):[cite: 1]
                st.session_state.recruiter_selected_ids = [][cite: 1]
                st.rerun()[cite: 1]
            if a3.button("Shortlist Selected Candidates", type="primary", use_container_width=True, key="shortlist_selected"):
                if not selected_ids:[cite: 1]
                    st.warning("Select at least one candidate first.")[cite: 1]
                else:
                    for candidate in candidates:[cite: 1]
                        if candidate.get("id") in selected_ids:[cite: 1]
                            candidate["status"] = "Shortlisted"[cite: 1]
                    persist_recruiter()[cite: 1]
                    st.success(f"Shortlisted {len(selected_ids)} candidate(s).")[cite: 1]
                    st.rerun()[cite: 1]
            if a4.button("Open Shortlist", use_container_width=True, key="go_shortlist"):[cite: 1]
                recruiter_navigate("Shortlisted Candidates")[cite: 1]
                st.rerun()[cite: 1]

            st.caption(f"Selected: {len(selected_ids)} • Shortlisted: {sum(1 for c in candidates if c.get('status') == 'Shortlisted')} • Unique: {len(candidates)}")[cite: 1]
            for idx, candidate in enumerate(candidates):[cite: 1]
                cid = candidate.get("id", str(idx))[cite: 1]
                default = cid in selected_ids[cite: 1]
                check = st.checkbox(
                    f"{candidate.get('name', 'Candidate')} · {candidate.get('role_match', 0)}% match · {candidate.get('email') or 'Email Missing'}",
                    value=default,
                    key=f"bulk_select_{cid}",
                )[cite: 1]
                if check:[cite: 1]
                    selected_ids.add(cid)[cite: 1]
                else:
                    selected_ids.discard(cid)[cite: 1]
                badge = "Shortlisted" if candidate.get("status") == "Shortlisted" else "Screened"
                email_label = candidate.get("email") or "Email Missing"[cite: 1]
                st.markdown(
                    f"<div class='content-box' style='padding:12px 16px;margin-bottom:8px;'>"
                    f"<b>{html.escape(str(candidate.get('name') or 'Candidate'))}</b>"
                    f" &nbsp;·&nbsp; Match <b>{candidate.get('role_match', 0)}%</b>"
                    f" &nbsp;·&nbsp; Resume {candidate.get('resume_score', 0)}"
                    f" &nbsp;·&nbsp; {html.escape(str(email_label))}"
                    f" &nbsp;·&nbsp; <span class='tag-badge tag-blue'>{badge}</span></div>",
                    unsafe_allow_html=True,
                )[cite: 1]
            st.session_state.recruiter_selected_ids = list(selected_ids)[cite: 1]

    elif st.session_state.active_tool == "Shortlisted Candidates":[cite: 1]
        st.markdown("### Shortlisted Candidates")
        shortlisted = [c for c in candidates if c.get("status") == "Shortlisted"][cite: 1]
        if not shortlisted:[cite: 1]
            st.info("No candidates are shortlisted yet. Go to Bulk Resume Screening and select candidates.")[cite: 1]
        else:
            table = pd.DataFrame([
                {
                    "Name": c.get("name"),
                    "Email": c.get("email") or "Email Missing",
                    "Match": f"{c.get('role_match', 0)}%",
                    "Email Status": c.get("email_status", "Missing"),
                    "Assessment": c.get("assessment_status", "Not Sent"),
                }
                for c in shortlisted
            ])[cite: 1]
            st.dataframe(table, use_container_width=True, hide_index=True)[cite: 1]
            b1, b2 = st.columns(2)[cite: 1]
            if b1.button("⬅ Back to Bulk Screening", use_container_width=True, key="shortlist_back"):[cite: 1]
                recruiter_navigate("Bulk Screening")[cite: 1]
                st.rerun()[cite: 1]
            if b2.button("Proceed to Assessment Dispatcher →", type="primary", use_container_width=True, key="shortlist_next"):[cite: 1]
                recruiter_navigate("Assessment Builder")[cite: 1]
                st.rerun()[cite: 1]

    elif st.session_state.active_tool == "Assessment Builder":[cite: 1]
        st.markdown("### Assessment Dispatcher")
        shortlisted = [c for c in candidates if c.get("status") == "Shortlisted"][cite: 1]
        eligible = [][cite: 1]
        seen_emails = set()[cite: 1]
        for candidate in shortlisted:[cite: 1]
            email = (candidate.get("email") or "").strip().lower()[cite: 1]
            if not email or email in seen_emails:[cite: 1]
                continue[cite: 1]
            seen_emails.add(email)[cite: 1]
            eligible.append(candidate)[cite: 1]

        role_target = campaign.get("role", "Software Developer")[cite: 1]
        company_target = campaign.get("company", "") or "Company"[cite: 1]
        recruiter_target = campaign.get("recruiter_name", st.session_state.get("username", "Recruiter"))[cite: 1]
        recruiter_email_target = campaign.get("recruiter_email", "")[cite: 1]
        if not company_target or not campaign.get("recruiter_name") or not recruiter_email_target:[cite: 1]
            st.error("Recruiter identity is incomplete. Go to Hiring Campaign and fill in required fields.")
        st.markdown(f"**Company:** {html.escape(company_target or 'Not configured')}  ·  **Recruiter:** {html.escape(recruiter_target or 'Not configured')}" + (f"  ·  **Contact:** {html.escape(recruiter_email_target)}" if recruiter_email_target else ""), unsafe_allow_html=True)[cite: 1]
        st.write(f"Target Role: **{role_target}**")[cite: 1]
        q_count = st.select_slider(
            "Assessment question count",
            options=list(range(10, 51, 5)),
            value=20,
            key="recruiter_assessment_question_count",
        )[cite: 1]
        duration_minutes = st.select_slider(
            "Assessment duration",
            options=[15, 20, 30, 45, 60, 90],
            value=30,
            format_func=lambda x: f"{x} minutes",
            key="recruiter_assessment_duration",
        )[cite: 1]
        st.markdown("#### Examination Access Window")
        w1, w2 = st.columns(2)[cite: 1]
        now_ist = _now_ist()[cite: 1]
        time_choices = _assessment_time_options(15)[cite: 1]
        default_open_label = now_ist.strftime("%I:%M %p").lstrip("0")[cite: 1]
        default_close_label = (now_ist + timedelta(hours=2)).strftime("%I:%M %p").lstrip("0")[cite: 1]
        if default_open_label not in time_choices:[cite: 1]
            default_open_label = time_choices[0][cite: 1]
        if default_close_label not in time_choices:[cite: 1]
            default_close_label = time_choices[8][cite: 1]

        open_date = w1.date_input("Open date (India)", value=now_ist.date(), key="assessment_open_date")[cite: 1]
        open_time_label = w1.selectbox("Open time (IST)", time_choices, index=time_choices.index(default_open_label), key="assessment_open_time_12h")[cite: 1]
        close_date = w2.date_input("Close date (India)", value=now_ist.date(), key="assessment_close_date")[cite: 1]
        close_time_label = w2.selectbox("Close time (IST)", time_choices, index=time_choices.index(default_close_label), key="assessment_close_time_12h")[cite: 1]
        open_time = _parse_12h_time(open_time_label)[cite: 1]
        close_time = _parse_12h_time(close_time_label)[cite: 1]
        start_at = _assessment_datetime_string(open_date, open_time)[cite: 1]
        end_at = _assessment_datetime_string(close_date, close_time)[cite: 1]
        start_dt = _parse_assessment_time(start_at)[cite: 1]
        end_dt = _parse_assessment_time(end_at)[cite: 1]
        valid_window = bool(start_dt and end_dt and end_dt > start_dt)[cite: 1]
        st.caption(f"India time: **{open_date.strftime('%d %b %Y')} {open_time_label}** → **{close_date.strftime('%d %b %Y')} {close_time_label}**")
        if not valid_window:[cite: 1]
            st.error("Close date/time must be later than open date/time.")[cite: 1]

        m1, m2, m3, m4 = st.columns(4)[cite: 1]
        m1.metric("Shortlisted", len(shortlisted))[cite: 1]
        m2.metric("Ready to Email", len(eligible))[cite: 1]
        m3.metric("Questions", q_count)[cite: 1]
        m4.metric("Duration", f"{duration_minutes} min")[cite: 1]

        if eligible and company_target and campaign.get("recruiter_name") and recruiter_email_target and valid_window:[cite: 1]
            st.dataframe(
                pd.DataFrame([{"Candidate": c.get("name"), "Email": c.get("email"), "Match": c.get("role_match", 0)} for c in eligible]),
                use_container_width=True,
                hide_index=True,
            )[cite: 1]
            if st.button("Send Assessment Invitations", icon=":material/mail:", type="primary", use_container_width=True, key="send_assessment_invitations"):[cite: 1]
                progress = st.progress(0, text="Dispatching assessment emails…")[cite: 1]
                rows = [][cite: 1]
                campaign_assessment_id = uuid.uuid4().hex[cite: 1]
                for idx, candidate in enumerate(eligible):[cite: 1]
                    token = _make_assessment_token({
                        "owner_user_id": st.session_state.get("user_id", ""),
                        "candidate_id": candidate.get("id", ""),
                        "assessment_id": campaign_assessment_id,
                        "candidate": {
                            "id": candidate.get("id", ""),
                            "name": candidate.get("name", "Candidate"),
                            "email": candidate.get("email", ""),
                            "phone": candidate.get("phone", ""),
                            "resume_score": candidate.get("resume_score", 0),
                            "role_match": candidate.get("role_match", 0),
                            "skills": candidate.get("skills", []),
                        },
                        "role": role_target,
                        "company": company_target,
                        "recruiter_name": recruiter_target,
                        "recruiter_email": recruiter_email_target,
                        "question_count": q_count,
                        "duration_minutes": duration_minutes,
                        "start_at": start_at,
                        "end_at": end_at,
                    })[cite: 1]
                    candidate_questions = generate_assessment_questions(role_target, q_count, seed=token)[cite: 1]
                    candidate_assessment = {
                        "id": campaign_assessment_id,
                        "role": role_target,
                        "company": company_target,
                        "recruiter_name": recruiter_target,
                        "recruiter_email": recruiter_email_target,
                        "questions": candidate_questions,
                        "question_count": q_count,
                        "duration_minutes": duration_minutes,
                        "start_at": start_at,
                        "end_at": end_at,
                        "created_at": datetime.now().isoformat(timespec="seconds"),
                        "candidate_tokens": {candidate.get("id", ""): token},
                        "candidate_id": candidate.get("id", ""),
                        "used": False,
                    }[cite: 1]
                    _save_public_assessment_record(st.session_state.get("user_id", ""), candidate.get("id", ""), candidate_assessment, token)[cite: 1]
                    test_link = _assessment_public_url(token)[cite: 1]
                    sent, msg = api_send_assessment_email(
                        candidate["email"], candidate.get("name", "Candidate"), role_target, test_link,
                        company_target, recruiter_target, recruiter_email_target, duration_minutes, q_count
                    )[cite: 1]
                    candidate["assessment_token"] = token[cite: 1]
                    candidate["assessment_link"] = test_link[cite: 1]
                    candidate["assessment_status"] = "Sent" if sent else "Failed"[cite: 1]
                    rows.append({
                        "Candidate": candidate.get("name"),
                        "Email": candidate.get("email"),
                        "Status": "Sent" if sent else "Failed",
                        "Details": msg,
                    })[cite: 1]
                    progress.progress((idx + 1) / max(1, len(eligible)))[cite: 1]

                data.setdefault("assessments", []).append({
                    "id": campaign_assessment_id,
                    "role": role_target,
                    "company": company_target,
                    "recruiter_name": recruiter_target,
                    "recruiter_email": recruiter_email_target,
                    "question_count": q_count,
                    "duration_minutes": duration_minutes,
                    "created_at": datetime.now().isoformat(timespec="seconds"),
                    "candidate_tokens": {c.get("id", ""): c.get("assessment_token") for c in eligible},
                    "candidate_count": len(eligible),
                })[cite: 1]
                persist_recruiter()[cite: 1]
                st.success("Assessment dispatch completed.")
                st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)[cite: 1]
        else:
            st.info("No shortlisted candidates with valid emails found.")[cite: 1]

    elif st.session_state.active_tool == "Score Vault":[cite: 1]
        st.markdown("### Assessment Score Vault")
        persisted_submissions = [][cite: 1]
        try:
            conn = get_db_connection()[cite: 1]
            rows = conn.execute(
                """SELECT result_json FROM assessment_submissions
                   WHERE owner_user_id=?
                   ORDER BY submitted_at DESC""",
                (st.session_state.user_id,),
            ).fetchall()[cite: 1]
            for (payload,) in rows:[cite: 1]
                try:
                    item = json.loads(payload) if isinstance(payload, str) else {}[cite: 1]
                    if isinstance(item, dict):[cite: 1]
                        persisted_submissions.append(item)[cite: 1]
                except (TypeError, ValueError, json.JSONDecodeError):
                    continue[cite: 1]
        except sqlite3.Error:
            persisted_submissions = [][cite: 1]

        merged = {}[cite: 1]
        for item in submissions + persisted_submissions:[cite: 1]
            if isinstance(item, dict):[cite: 1]
                key = str(item.get("token") or f"{item.get('candidate_id','')}:{item.get('submitted_at','')}")[cite: 1]
                merged[key] = item[cite: 1]
        visible_submissions = list(merged.values())[cite: 1]

        if st.button("Refresh Results", icon=":material/refresh:", use_container_width=True, key="refresh_assessment_results"):[cite: 1]
            st.session_state.recruiter_data = _db_load_recruiter_state(st.session_state.user_id)[cite: 1]
            st.session_state.recruiter_candidates = st.session_state.recruiter_data.get("candidates", [])[cite: 1]
            st.rerun()[cite: 1]

        if not visible_submissions:[cite: 1]
            st.info("No assessment submissions recorded yet.")[cite: 1]
        else:
            result_rows = [][cite: 1]
            for item in visible_submissions:[cite: 1]
                result_rows.append({
                    "Candidate": item.get("candidate_name", "Candidate"),
                    "Email": item.get("candidate_email", ""),
                    "Role": item.get("role", ""),
                    "Score": f"{item.get('score', 0)}/{item.get('total', 0)}",
                    "Percentage": f"{float(item.get('percentage', 0)):.1f}%",
                    "Status": "Completed",
                    "Submitted": item.get("submitted_at", ""),
                })[cite: 1]
            st.dataframe(pd.DataFrame(result_rows), use_container_width=True, hide_index=True)[cite: 1]

    elif st.session_state.active_tool == "Interview Pipeline":[cite: 1]
        st.markdown("### Interview Pipeline")
        if candidates:[cite: 1]
            st.dataframe(pd.DataFrame(candidates), use_container_width=True, hide_index=True)[cite: 1]
        else:
            st.info("No candidates in the pipeline yet.")[cite: 1]


# ============================================================
# STATE PERSISTENCE & FOOTER
# ============================================================
def _persist_current_user_state():
    uid = st.session_state.get("user_id", "")[cite: 1]
    if not uid:[cite: 1]
        return[cite: 1]
    try:
        _db_save_state(uid, {
            "username": st.session_state.get("username", ""),
            "resume_text": st.session_state.get("resume_text", ""),
            "resume_analysis": st.session_state.get("resume_analysis"),
            "job_match_result": st.session_state.get("job_match_result"),
            "resume_builder": st.session_state.get("resume_builder", {}),
        })[cite: 1]
    except (sqlite3.Error, TypeError, ValueError):
        pass[cite: 1]


_persist_current_user_state()[cite: 1]

st.markdown(
    """
    <div style="text-align: center; color: #94a3b8; font-size: 0.82rem; padding: 36px 0 10px;">
        CareerLens AI · Career Intelligence, Reimagined · © 2026
    </div>
    """,
    unsafe_allow_html=True,
)
