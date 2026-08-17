"""
BIT Mesra T&P Portal Scraper
Logs in, fetches the dashboard job table, parses it into structured data.
"""

import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()  # reads .env in the current working directory into os.environ

BASE_URL = "https://tp.bitmesra.co.in"
LOGIN_PAGE_URL = f"{BASE_URL}/index.html"          # login page is served at root
LOGIN_POST_URL = f"{BASE_URL}/auth/login.html"     # confirmed from form action
DASHBOARD_URL = f"{BASE_URL}/index.html"           # same URL, content differs once logged in

# Pull from environment (GitHub Actions secrets) rather than hardcoding
USERNAME = os.environ.get("TNP_USERNAME", "YOUR_ROLL_NO")
PASSWORD = os.environ.get("TNP_PASSWORD", "YOUR_PASSWORD")


def get_login_page(session: requests.Session):
    """Fetch login page — primarily to set initial session cookie."""
    resp = session.get(LOGIN_PAGE_URL)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def login(session: requests.Session) -> bool:
    # No CSRF token in this form — just prime the session cookie first
    get_login_page(session)

    payload = {
        "identity": USERNAME,
        "password": PASSWORD,
        "submit": "Login",
    }

    resp = session.post(LOGIN_POST_URL, data=payload)
    resp.raise_for_status()

    # Success check: logged-in dashboard has a #job-listings table and a Logout link;
    # the login form (identity/password fields) should be gone.
    soup = BeautifulSoup(resp.text, "html.parser")
    still_has_login_form = soup.find("input", {"name": "identity"}) is not None
    return not still_has_login_form


def fetch_dashboard(session: requests.Session) -> str:
    resp = session.get(DASHBOARD_URL)
    resp.raise_for_status()
    return resp.text


def parse_jobs(html: str):
    """Parse the #job-listings table into a list of dicts."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", {"id": "job-listings"})
    if not table:
        return []

    jobs = []
    for row in table.find("tbody").find_all("tr"):
        cells = row.find_all("td")
        if len(cells) < 4:
            continue

        company = cells[0].get_text(strip=True)
        deadline = cells[1].get_text(strip=True)
        posted_on = cells[2].get_text(strip=True)

        action_links = cells[3].find_all("a")
        notice_url = action_links[0]["href"] if len(action_links) > 0 else None
        apply_url = action_links[1]["href"] if len(action_links) > 1 else None

        # job hash id is embedded in the notice/apply URL, e.g. job/notice/<hash>
        job_id = notice_url.rstrip("/").split("/")[-1] if notice_url else None

        jobs.append({
            "job_id": job_id,
            "company": company,
            "deadline": deadline,
            "posted_on": posted_on,
            "notice_url": f"{BASE_URL}/{notice_url}" if notice_url else None,
            "apply_url": f"{BASE_URL}/{apply_url}" if apply_url else None,
        })

    return jobs


def main():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (compatible; TnPJobScraper/1.0)"
    })

    if not login(session):
        raise RuntimeError("Login failed — check credentials/selectors")

    html = fetch_dashboard(session)
    jobs = parse_jobs(html)

    for job in jobs:
        print(job)

    return jobs


if __name__ == "__main__":
    main()