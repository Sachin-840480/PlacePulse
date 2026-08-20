"""
PlacePulse — Firestore sync + push notification trigger.

Flow each run:
  1. Scrape current job listings from the T&P portal (via scraper.py).
  2. Compare against what's already stored in Firestore (`jobs` collection,
     doc ID = job_id).
  3. Write any new jobs to Firestore.
  4. If there are new jobs, send one FCM push to the 'new-jobs' topic,
     summarizing what's new (all app installs subscribe to this topic).
"""

import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, messaging

from scraper.scraper import scrape_jobs

SERVICE_ACCOUNT_PATH = os.environ.get("FIREBASE_KEY_PATH", "firebase-key.json")
JOBS_COLLECTION = "jobs"
FCM_TOPIC = "new-jobs"


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def get_existing_job_ids(db) -> set:
    """Return the set of job_ids already stored in Firestore."""
    docs = db.collection(JOBS_COLLECTION).stream()
    return {doc.id for doc in docs}


def parse_posted_on(posted_on: str):
    """Portal dates are dd/mm/yyyy strings — parse into a real datetime
    so Firestore can sort by it correctly. Falls back to None (job sorts
    last) if the format ever changes unexpectedly, rather than crashing
    the whole sync."""
    try:
        return datetime.strptime(posted_on, "%d/%m/%Y")
    except (ValueError, TypeError):
        return None


def write_new_jobs(db, new_jobs: list):
    """Write each new job as a Firestore doc, keyed by job_id."""
    batch = db.batch()
    for job in new_jobs:
        doc_ref = db.collection(JOBS_COLLECTION).document(job["job_id"])
        batch.set(doc_ref, {
            **job,
            "posted_on_date": parse_posted_on(job["posted_on"]),
            "first_seen_at": firestore.SERVER_TIMESTAMP,
        })
    batch.commit()


def send_push_notification(new_jobs: list):
    """Send one FCM push to all subscribers of the 'new-jobs' topic."""
    if not new_jobs:
        return

    if len(new_jobs) == 1:
        title = "New job posted"
        body = f"{new_jobs[0]['company']} — apply before {new_jobs[0]['deadline']}"
    else:
        companies = ", ".join(j["company"] for j in new_jobs[:3])
        if len(new_jobs) > 3:
            companies += f" +{len(new_jobs) - 3} more"
        title = f"{len(new_jobs)} new jobs posted"
        body = companies

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        topic=FCM_TOPIC,
        data={
            "job_ids": ",".join(j["job_id"] for j in new_jobs),
        },
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                channel_id="new-jobs-high-v2",  # must match NEW_JOBS_CHANNEL_ID in the app
            ),
        ),
    )

    response = messaging.send(message)
    print(f"FCM push sent: {response}")


def write_sync_meta(db):
    """Record that a sync run happened, regardless of whether new jobs were found."""
    db.collection("meta").document("sync").set({
        "lastSyncedAt": firestore.SERVER_TIMESTAMP,
    })


def sync():
    db = init_firebase()

    scraped_jobs = scrape_jobs()
    existing_ids = get_existing_job_ids(db)

    new_jobs = [job for job in scraped_jobs if job["job_id"] not in existing_ids]

    if not new_jobs:
        print(f"No new jobs. {len(scraped_jobs)} total on portal, all already known.")
        write_sync_meta(db)
        return

    print(f"Found {len(new_jobs)} new job(s): {[j['company'] for j in new_jobs]}")
    write_new_jobs(db, new_jobs)
    write_sync_meta(db)
    send_push_notification(new_jobs)


if __name__ == "__main__":
    sync()
