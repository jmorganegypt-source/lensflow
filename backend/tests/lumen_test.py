"""LUMEN backend API tests (pytest). Separate brand from LensFlow."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/lumen"
LENSFLOW_API = f"{BASE_URL}/api"

LENSFLOW_ADMIN_EMAIL = "admin@lensflow.ai"
LENSFLOW_ADMIN_PASSWORD = "LensFlow2026!"

state = {}


@pytest.fixture(scope="session")
def lumen_user():
    """Fresh registered Lumen user, returns requests.Session with Bearer."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"TEST_lumen_{uuid.uuid4().hex[:8]}@example.com"
    password = "Lumen0Pass!"
    name = "Lumen Tester"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name}, timeout=30)
    assert r.status_code == 200, f"Lumen register failed: {r.status_code} {r.text}"
    data = r.json()
    token = data["access_token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    state["lumen_email"] = email
    state["lumen_password"] = password
    state["lumen_token"] = token
    state["lumen_user"] = data["user"]
    return s


# ---------- Catalogs ----------
def test_catalogs():
    r = requests.get(f"{API}/catalogs", timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert len(j["occasions"]) == 11, f"Expected 11 occasions, got {len(j['occasions'])}"
    assert len(j["looks"]) == 8, f"Expected 8 looks, got {len(j['looks'])}"
    assert len(j["music"]) == 9, f"Expected 9 music, got {len(j['music'])}"
    assert len(j["backgrounds"]) == 8, f"Expected 8 backgrounds, got {len(j['backgrounds'])}"
    assert len(j["voices"]) == 4, f"Expected 4 voices, got {len(j['voices'])}"


# ---------- Auth lifecycle ----------
def test_register_creates_user_with_trial(lumen_user):
    user = state["lumen_user"]
    assert user["minutes_credit"] == 0
    assert user["watermark_subscription"] is False
    assert user["in_trial"] is True
    assert user["trial_until"] is not None
    # token must be present (cookie or Bearer header)
    assert state["lumen_token"]


def test_login_and_me_and_logout():
    email = state["lumen_email"]
    password = state["lumen_password"]
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    # /me with Bearer
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["user"]["email"] == email.lower()
    # logout
    r = requests.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r.status_code == 200


def test_register_duplicate_email():
    r = requests.post(f"{API}/auth/register",
                      json={"email": state["lumen_email"], "password": "Other!", "name": "Dup"}, timeout=15)
    assert r.status_code == 400


def test_login_invalid_password():
    r = requests.post(f"{API}/auth/login",
                      json={"email": state["lumen_email"], "password": "WRONG"}, timeout=15)
    assert r.status_code == 401


# ---------- Auth isolation from LensFlow ----------
def test_lensflow_jwt_rejected_by_lumen():
    """LensFlow admin login → use that token against /api/lumen/auth/me → must 401."""
    r = requests.post(f"{LENSFLOW_API}/auth/login",
                      json={"email": LENSFLOW_ADMIN_EMAIL, "password": LENSFLOW_ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"LensFlow login failed: {r.text}"
    lf_token = r.json()["access_token"]
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {lf_token}"}, timeout=15)
    assert r.status_code == 401, f"LensFlow JWT must be rejected by Lumen: got {r.status_code} {r.text}"


# ---------- AI Scripts (GPT-5.2) ----------
def test_generate_script(lumen_user):
    payload = {"occasion": "birthday", "recipient_name": "Mum",
               "notes": "loves gardening", "length": "medium"}
    r = lumen_user.post(f"{API}/scripts", json=payload, timeout=120)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["script"] and isinstance(j["script"], str)
    assert j["word_count"] > 10
    assert j["occasion"]["id"] == "birthday"


def test_generate_script_unknown_occasion(lumen_user):
    r = lumen_user.post(f"{API}/scripts", json={"occasion": "nonsense",
                        "recipient_name": "X", "length": "short"}, timeout=20)
    assert r.status_code == 400


def test_scripts_requires_auth():
    r = requests.post(f"{API}/scripts", json={"occasion": "birthday",
                      "recipient_name": "Mum", "length": "short"}, timeout=15)
    assert r.status_code == 401


# ---------- TTS Preview (LIVE ElevenLabs) ----------
def test_tts_preview(lumen_user):
    payload = {"text": "Hello there.", "voice_id": "pFZP5JQG7iQjIQuC4Bku"}
    r = lumen_user.post(f"{API}/tts/preview", json=payload, timeout=60)
    assert r.status_code in (200, 404), f"Unexpected {r.status_code}: {r.text}"
    if r.status_code == 200:
        j = r.json()
        assert j["audio_url"].startswith("data:audio/mpeg;base64,")
        assert len(j["audio_url"]) > 200


# ---------- Moments CRUD ----------
def test_moments_full_crud(lumen_user):
    payload = {
        "occasion": "birthday",
        "recipient_name": "Mum",
        "script": "Happy birthday Mum, you are amazing.",
        "look_id": "glow",
        "music_id": "sunrise",
        "background_id": "garden",
        "voice_id": "pFZP5JQG7iQjIQuC4Bku",
        "duration_seconds": 0,
    }
    r = lumen_user.post(f"{API}/moments", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    moment = r.json()
    assert moment["id"] and moment["share_token"]
    assert moment["sent"] is False
    mid = moment["id"]
    state["moment_id"] = mid
    state["share_token"] = moment["share_token"]

    # LIST
    r = lumen_user.get(f"{API}/moments", timeout=15)
    assert r.status_code == 200
    assert any(m["id"] == mid for m in r.json()["moments"])

    # PATCH
    r = lumen_user.patch(f"{API}/moments/{mid}",
                        json={"script": "Updated script for Mum."}, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json()["script"] == "Updated script for Mum."

    # GET single
    r = lumen_user.get(f"{API}/moments/{mid}", timeout=15)
    assert r.status_code == 200


def test_moments_user_scoping():
    """Create a second user → first user's moment must be invisible/404."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"TEST_lumen_other_{uuid.uuid4().hex[:6]}@example.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Pass0!!", "name": "Other"}, timeout=20)
    assert r.status_code == 200
    s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})

    # Should NOT see other user's moment
    r = s.get(f"{API}/moments", timeout=15)
    assert r.status_code == 200
    assert not any(m["id"] == state.get("moment_id") for m in r.json()["moments"])

    r = s.get(f"{API}/moments/{state['moment_id']}", timeout=15)
    assert r.status_code == 404


# ---------- Send moment ----------
def test_send_moment(lumen_user):
    mid = state["moment_id"]
    r = lumen_user.post(f"{API}/moments/{mid}/send",
                        json={"recipient_email": "TEST_recipient@example.com",
                              "sender_note": "For you"}, timeout=20)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["success"] is True
    assert "share_url" in j and "/lumen/share/" in j["share_url"]

    # Verify moment marked sent
    r = lumen_user.get(f"{API}/moments/{mid}", timeout=15)
    assert r.json()["sent"] is True


# ---------- Public share view ----------
def test_public_share_no_auth():
    token = state["share_token"]
    r = requests.get(f"{API}/share/{token}", timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["recipient_name"] == "Mum"
    assert j["script"]
    assert j["sender_name"]  # should be lumen tester name
    assert j["watermark"] is True  # no subscription
    # views increments
    views1 = j["views"]
    r = requests.get(f"{API}/share/{token}", timeout=15)
    assert r.json()["views"] == views1 + 1


def test_public_share_unknown_token():
    r = requests.get(f"{API}/share/nonexistent_token_xyz", timeout=15)
    assert r.status_code == 404


# ---------- Payments ----------
def test_checkout_1h_pack(lumen_user):
    r = lumen_user.post(f"{API}/payments/checkout",
                        json={"package_id": "lumen_1h", "origin_url": BASE_URL}, timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "checkout.stripe.com" in j["url"]
    assert j["session_id"].startswith("cs_")
    state["lumen_session_id"] = j["session_id"]


def test_checkout_other_packs(lumen_user):
    for pid in ["lumen_2h", "lumen_3h", "lumen_nowm"]:
        r = lumen_user.post(f"{API}/payments/checkout",
                            json={"package_id": pid, "origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 200, f"{pid}: {r.status_code} {r.text}"
        assert "checkout.stripe.com" in r.json()["url"]


def test_checkout_invalid_package(lumen_user):
    r = lumen_user.post(f"{API}/payments/checkout",
                        json={"package_id": "fake_pack", "origin_url": BASE_URL}, timeout=15)
    assert r.status_code == 400


def test_checkout_unauthenticated():
    r = requests.post(f"{API}/payments/checkout",
                      json={"package_id": "lumen_1h", "origin_url": BASE_URL}, timeout=15)
    assert r.status_code == 401


def test_payment_status_graceful(lumen_user):
    sid = state.get("lumen_session_id")
    if not sid:
        pytest.skip("Need checkout session id")
    r = lumen_user.get(f"{API}/payments/status/{sid}", timeout=20)
    assert r.status_code == 200, f"Must not 500: {r.status_code} {r.text}"
    j = r.json()
    assert j["payment_status"] in ("initiated", "paid", "unpaid", "no_payment_required")
    assert j["package_id"] == "lumen_1h"


# ---------- Minutes gating ----------
def test_minutes_gating_blocks_when_no_credit():
    """Create a user, force trial_until to past, set minutes_used_period >= 10,
    then attempt to create moment with duration_seconds > 0 → expect 402."""
    import pymongo
    from datetime import datetime, timezone, timedelta

    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"TEST_lumen_gate_{uuid.uuid4().hex[:6]}@example.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Pass0!!", "name": "Gate"}, timeout=20)
    assert r.status_code == 200
    token = r.json()["access_token"]
    s.headers.update({"Authorization": f"Bearer {token}"})

    # Mutate user in mongo
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "lensflow_db")
    client = pymongo.MongoClient(mongo_url)
    try:
        past = datetime.now(timezone.utc) - timedelta(days=1)
        res = client[db_name].lumen_users.update_one(
            {"email": email.lower()},
            {"$set": {"trial_until": past, "minutes_used_period": 10, "minutes_credit": 0}}
        )
        assert res.modified_count == 1
    finally:
        client.close()

    # Now creation with duration > 0 must 402
    r = s.post(f"{API}/moments", json={
        "occasion": "birthday", "recipient_name": "X",
        "script": "hi", "duration_seconds": 60
    }, timeout=15)
    assert r.status_code == 402, f"Expected 402 gating, got {r.status_code}: {r.text}"

    # But duration=0 is allowed (draft)
    r = s.post(f"{API}/moments", json={
        "occasion": "birthday", "recipient_name": "X",
        "script": "hi", "duration_seconds": 0
    }, timeout=15)
    assert r.status_code == 200


# ---------- Moment delete (last) ----------
def test_delete_moment(lumen_user):
    mid = state.get("moment_id")
    if not mid:
        pytest.skip("No moment created")
    r = lumen_user.delete(f"{API}/moments/{mid}", timeout=15)
    assert r.status_code == 200
    r = lumen_user.get(f"{API}/moments/{mid}", timeout=15)
    assert r.status_code == 404


# ---------- Cleanup ----------
def test_zz_cleanup():
    """Best-effort cleanup of TEST_ prefixed lumen data."""
    import pymongo
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "lensflow_db")
    client = pymongo.MongoClient(mongo_url)
    try:
        # Find test users
        test_users = list(client[db_name].lumen_users.find({"email": {"$regex": "^TEST_"}}))
        user_ids = [str(u["_id"]) for u in test_users]
        client[db_name].lumen_moments.delete_many({"user_id": {"$in": user_ids}})
        client[db_name].lumen_payments.delete_many({"user_id": {"$in": user_ids}})
        client[db_name].lumen_users.delete_many({"email": {"$regex": "^TEST_"}})
    finally:
        client.close()
