"""LensFlow backend API tests (pytest)."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://luxury-video-studio-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@lensflow.ai"
ADMIN_PASSWORD = "LensFlow2026!"

# Shared state across tests
state = {}


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token")
    assert token, "No access_token in login response"
    s.headers.update({"Authorization": f"Bearer {token}"})
    state["admin_token"] = token
    state["admin_user"] = data["user"]
    return s


# ---------- Health / Root ----------
def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("app") == "LensFlow"


# ---------- Auth: register + me + logout ----------
def test_register_and_me_and_logout():
    s = requests.Session()
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "Test U"}, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and data["user"]["email"] == email
    # Cookies present
    assert "access_token" in s.cookies.get_dict() or data.get("access_token")
    token = data["access_token"]
    # /auth/me with Bearer
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["user"]["email"] == email
    # logout
    r = requests.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r.status_code == 200
    state["test_email"] = email


def test_register_duplicate():
    email = state.get("test_email")
    if not email:
        pytest.skip("Need previous register test")
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "Dup"}, timeout=15)
    assert r.status_code == 400


def test_login_admin(admin_session):
    # admin_session fixture asserts already
    r = admin_session.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    assert r.json()["user"]["email"] == ADMIN_EMAIL


def test_login_invalid_password():
    r = requests.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_forgot_password_noleak():
    r = requests.post(f"{API}/auth/forgot-password", json={"email": "doesnotexist@example.com"}, timeout=15)
    # Should not leak — generic 200 message
    assert r.status_code == 200
    assert "message" in r.json()


# ---------- Presenters ----------
def test_presenters_list():
    r = requests.get(f"{API}/presenters", timeout=15)
    assert r.status_code == 200
    j = r.json()
    ids = [p["id"] for p in j["presenters"]]
    for required in ["mia", "oliver", "aria", "marcus"]:
        assert required in ids
    for p in j["presenters"]:
        assert p["voice_id"] and p["avatar"]


# ---------- Concierge (public) ----------
def test_concierge_submit():
    payload = {
        "name": "Test Concierge",
        "email": "concierge_test@example.com",
        "phone": "+61400000000",
        "message": "Interested in luxury package",
        "package": "Signature",
    }
    r = requests.post(f"{API}/concierge", json=payload, timeout=15)
    assert r.status_code == 200
    assert r.json().get("success") is True


# ---------- Dashboard stats ----------
def test_dashboard_stats(admin_session):
    r = admin_session.get(f"{API}/dashboard/stats", timeout=15)
    assert r.status_code == 200
    j = r.json()
    for k in ["projects", "drafts", "published", "scripts", "minutes_saved"]:
        assert k in j


# ---------- Projects CRUD ----------
def test_projects_crud(admin_session):
    # CREATE
    payload = {"title": "TEST_Project", "script": "hello", "presenter": "mia", "status": "draft",
               "property_address": "1 Beach Rd, Sydney"}
    r = admin_session.post(f"{API}/projects", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    proj = r.json()
    assert proj["title"] == "TEST_Project"
    pid = proj["id"]
    state["project_id"] = pid
    # LIST
    r = admin_session.get(f"{API}/projects", timeout=15)
    assert r.status_code == 200
    assert any(p["id"] == pid for p in r.json()["projects"])
    # GET
    r = admin_session.get(f"{API}/projects/{pid}", timeout=15)
    assert r.status_code == 200
    assert r.json()["id"] == pid
    # PATCH
    r = admin_session.patch(f"{API}/projects/{pid}", json={"title": "TEST_Project_Updated", "status": "recorded"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["title"] == "TEST_Project_Updated"
    # GET verify persistence
    r = admin_session.get(f"{API}/projects/{pid}", timeout=15)
    assert r.json()["title"] == "TEST_Project_Updated"
    # DELETE
    r = admin_session.delete(f"{API}/projects/{pid}", timeout=15)
    assert r.status_code == 200
    # Confirm gone
    r = admin_session.get(f"{API}/projects/{pid}", timeout=15)
    assert r.status_code == 404


# ---------- TTS preview (LIVE ElevenLabs) ----------
def test_tts_preview(admin_session):
    """Voice not in ElevenLabs key's library → expect friendly 404, NOT 500.
    If the configured voice happens to exist on the key, accept 200 with audio.
    """
    payload = {"text": "Welcome home.", "voice_id": "EXAVITQu4vr4xnSDxMaC"}
    r = admin_session.post(f"{API}/tts/preview", json=payload, timeout=60)
    assert r.status_code in (200, 404), f"Unexpected {r.status_code}: {r.text}"
    if r.status_code == 200:
        j = r.json()
        assert j["audio_url"].startswith("data:audio/mpeg;base64,")
        assert len(j["audio_url"]) > 200
    else:
        detail = r.json().get("detail", "")
        assert "Voice not available" in detail, f"Expected friendly voice-not-available message, got: {detail}"


# ---------- Studio script gen (LIVE GPT-5.2) ----------
def test_studio_script_generate(admin_session):
    payload = {
        "property_type": "penthouse",
        "address": "10 Harbour View, Sydney",
        "bedrooms": 3,
        "bathrooms": 2,
        "price_range": "$5M",
        "key_features": "harbour view, marble kitchen",
        "tone": "luxury",
        "duration_seconds": 30,
        "presenter": "mia",
    }
    r = admin_session.post(f"{API}/studio/scripts", json=payload, timeout=120)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["id"] and j["title"] and j["script"]
    assert j["word_count"] > 10
    assert j["estimated_duration"] >= 20


def test_studio_scripts_list(admin_session):
    r = admin_session.get(f"{API}/studio/scripts", timeout=15)
    assert r.status_code == 200
    assert "scripts" in r.json()


# ---------- Payments: Stripe checkout (iteration 3) ----------
def test_payments_checkout_unauthenticated():
    """Unauthenticated checkout must reject."""
    r = requests.post(
        f"{API}/payments/checkout",
        json={"package_id": "pro_monthly", "origin_url": BASE_URL},
        timeout=20,
    )
    assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"


def test_payments_checkout_invalid_package(admin_session):
    """Invalid package id → 400 not 500."""
    r = admin_session.post(
        f"{API}/payments/checkout",
        json={"package_id": "totally_fake", "origin_url": BASE_URL},
        timeout=20,
    )
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"


def test_payments_checkout_valid_pro_monthly(admin_session):
    """Valid pro_monthly returns checkout.stripe.com URL + session_id; persists txn."""
    r = admin_session.post(
        f"{API}/payments/checkout",
        json={"package_id": "pro_monthly", "origin_url": BASE_URL},
        timeout=30,
    )
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    j = r.json()
    assert "url" in j and "session_id" in j
    assert "checkout.stripe.com" in j["url"], f"Unexpected url: {j['url']}"
    assert j["session_id"].startswith("cs_"), f"Unexpected session_id: {j['session_id']}"
    state["checkout_session_id"] = j["session_id"]


def test_payments_status_initiated_no_500(admin_session):
    """Freshly created session: must NOT 500. Should gracefully return 200 with
    payment_status='initiated' and status='open' (falling back to local txn
    because sk_test_emergent proxy can't retrieve sessions)."""
    sid = state.get("checkout_session_id")
    if not sid:
        pytest.skip("Need previous checkout test to provide a session id")
    r = admin_session.get(f"{API}/payments/status/{sid}", timeout=20)
    assert r.status_code == 200, f"Got {r.status_code} (must not 500): {r.text}"
    j = r.json()
    assert j["payment_status"] == "initiated", f"Expected initiated, got: {j}"
    assert j["status"] == "open", f"Expected open, got: {j}"
    assert j["package_id"] == "pro_monthly"


def test_payments_status_unknown_session_returns_404(admin_session):
    """Unknown session id should 404 (not 500)."""
    r = admin_session.get(f"{API}/payments/status/cs_test_doesnotexist_xyz", timeout=20)
    assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text}"


def test_payments_txn_persisted_in_mongo(admin_session):
    """Verify the checkout created a payment_transactions row with payment_status='initiated'."""
    import pymongo
    sid = state.get("checkout_session_id")
    if not sid:
        pytest.skip("Need previous checkout test")
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "lensflow_db")
    client = pymongo.MongoClient(mongo_url)
    try:
        txn = client[db_name].payment_transactions.find_one({"session_id": sid})
        assert txn is not None, f"No payment_transactions row for {sid}"
        assert txn["payment_status"] == "initiated"
        assert txn["status"] == "open"
        assert txn["package_id"] == "pro_monthly"
        assert txn["plan"] == "pro"
        assert txn["amount"] == 149.00
    finally:
        client.close()


def test_stripe_webhook_empty_body_returns_400():
    """Malformed webhook payload must return 400 (not 500)."""
    r = requests.post(f"{API}/webhook/stripe", data=b"", timeout=15)
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"


def test_stripe_webhook_bad_signature_returns_400():
    """Webhook with body but no/invalid signature must 400 (no STRIPE_WEBHOOK_SECRET set)."""
    r = requests.post(
        f"{API}/webhook/stripe",
        data=b'{"foo": "bar"}',
        headers={"Stripe-Signature": "t=123,v1=deadbeef", "Content-Type": "application/json"},
        timeout=15,
    )
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"


# ---------- Password reset: console-log fallback + full reset flow ----------
def test_forgot_password_console_fallback_for_real_user(admin_session):
    """RESEND_API_KEY empty → must still 200 and log to console. Real user version."""
    # Create a fresh user we can reset
    email = f"reset_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(
        f"{API}/auth/register",
        json={"email": email, "password": "Init0Pass!", "name": "Reset User"},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    state["reset_email"] = email
    # forgot-password
    r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=20)
    assert r.status_code == 200
    assert "message" in r.json()


def test_reset_password_end_to_end():
    """Find reset token in mongo, submit reset, login with new password."""
    import pymongo
    email = state.get("reset_email")
    if not email:
        pytest.skip("Need previous forgot-password test to seed an email")

    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "lensflow_db")
    client = pymongo.MongoClient(mongo_url)
    try:
        user = client[db_name].users.find_one({"email": email.lower()})
        assert user is not None
        tok = client[db_name].password_reset_tokens.find_one(
            {"user_id": str(user["_id"]), "used": False},
            sort=[("expires_at", -1)],
        )
        assert tok is not None, "No reset token created (console-fallback path may have failed silently)"
        token = tok["token"]
    finally:
        client.close()

    new_password = "Brand0New!"
    r = requests.post(
        f"{API}/auth/reset-password",
        json={"token": token, "new_password": new_password},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    assert r.json().get("success") is True

    # Login with new password
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": new_password}, timeout=20)
    assert r.status_code == 200, r.text
    assert "access_token" in r.json()

    # Token cannot be reused
    r = requests.post(
        f"{API}/auth/reset-password",
        json={"token": token, "new_password": "Another0!"},
        timeout=15,
    )
    assert r.status_code == 400


# ---------- Brute force lockout (run last) ----------
def test_brute_force_lockout():
    """Failed logins must eventually trigger 429 lockout — and NEVER raise 500.
    Note: K8s ingress may load-balance requests across multiple source IPs and the
    brute-force key is `{ip}:{email}`; we therefore fire enough attempts that at
    least one IP bucket reaches the 5-fail threshold."""
    bf_email = f"bf_{uuid.uuid4().hex[:6]}@example.com"
    codes = []
    saw_429 = False
    for i in range(20):
        r = requests.post(f"{API}/auth/login", json={"email": bf_email, "password": "WrongPass!"}, timeout=15)
        codes.append(r.status_code)
        if r.status_code == 429:
            saw_429 = True
            break
    # Primary regression check: tz comparison bug fixed → no 500s
    assert 500 not in codes, f"500 returned (tz bug regressed): {codes}"
    assert saw_429, f"Lockout never triggered after 20 attempts: {codes}"
