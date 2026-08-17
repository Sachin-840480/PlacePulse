"""
BIT Mesra T&P Portal Scraper
Logs in, fetches the dashboard job table, parses it into structured data.

NOTE: Login form field names, action URL, and CSRF token handling below
are PLACEHOLDERS. Need actual login page HTML to fill these in correctly.
"""

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://tp.bitmesra.co.in"
LOGIN_PAGE_URL = f"{BASE_URL}/login"        # placeholder — confirm actual path
LOGIN_POST_URL = f"{BASE_URL}/login"        # placeholder — confirm form action
DASHBOARD_URL = f"{BASE_URL}/index.html"    # from your screenshot

USERNAME = "YOUR_ROLL_NO"      # move to env var / GitHub secret later
PASSWORD = "YOUR_PASSWORD"     # move to env var / GitHub secret later


def get_login_page(session: requests.Session):
    """Fetch login page, return parsed soup (for token extraction) + sets session cookie."""
    resp = session.get(LOGIN_PAGE_URL)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def extract_csrf_token(soup: BeautifulSoup):
    """
    Placeholder — adjust selector once we see the real form.
    Common patterns:
      <input type="hidden" name="_token" value="...">
      <input type="hidden" name="csrf_token" value="...">
    """
    token_input = soup.find("input", {"name": "_token"})
    return token_input["value"] if token_input else None


def login(session: requests.Session) -> bool:
    login_soup = get_login_page(session)
    csrf_token = extract_csrf_token(login_soup)

    payload = {
        "username": USERNAME,   # placeholder — confirm real field name
        "password": PASSWORD,   # placeholder — confirm real field name
    }
    if csrf_token:
        payload["_token"] = csrf_token

    resp = session.post(LOGIN_POST_URL, data=payload)
    resp.raise_for_status()

    # crude success check — refine once we know what a real failure looks like
    return "logout.html" in resp.text or "Satyam Kumar" not in resp.text is False


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