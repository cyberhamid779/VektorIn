"""
Hackathon scraper: Devpost (açıq), MLH, edumap.az
Keçmiş tarixli nəticələr avtomatik süzülür.
"""
import re
import time
import logging
from datetime import datetime

import requests
from bs4 import BeautifulSoup

log = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

TODAY = datetime.now()

MONTHS_EN = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_deadline(text: str) -> datetime | None:
    if not text:
        return None
    text = text.strip()

    m = re.search(
        r"(\d{1,2})\s+(january|february|march|april|may|june|july|august|"
        r"september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)"
        r"\s+(\d{4})", text, re.IGNORECASE
    )
    if m:
        try:
            return datetime(int(m.group(3)), MONTHS_EN[m.group(2).lower()], int(m.group(1)))
        except Exception:
            pass

    m = re.search(
        r"(january|february|march|april|may|june|july|august|"
        r"september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)"
        r"\s+(\d{1,2}),?\s+(\d{4})", text, re.IGNORECASE
    )
    if m:
        try:
            return datetime(int(m.group(3)), MONTHS_EN[m.group(1).lower()], int(m.group(2)))
        except Exception:
            pass

    m = re.search(r"(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})", text)
    if m:
        try:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except Exception:
            pass

    m = re.search(r"(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})", text)
    if m:
        try:
            return datetime(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        except Exception:
            pass

    return None


def is_expired(deadline_str: str) -> bool:
    dt = parse_deadline(deadline_str)
    if dt is None:
        return False
    return dt < TODAY


def scrape_devpost() -> list[dict]:
    results = []
    url = "https://devpost.com/hackathons?challenge_type=online&open_to=public&status=open&order_by=deadline"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        for card in soup.select("article.hackathon-tile")[:12]:
            title_el = card.select_one("h3")
            link_el = card.select_one("a.tile-anchor")
            deadline_el = card.select_one(".submission-period") or card.select_one("time")
            prize_el = card.select_one(".prize-amount")

            if not title_el or not link_el:
                continue

            title = title_el.get_text(strip=True)
            href = link_el.get("href", "")
            if not href.startswith("http"):
                href = "https://devpost.com" + href

            deadline_text = deadline_el.get_text(strip=True) if deadline_el else ""
            prize = prize_el.get_text(strip=True) if prize_el else ""
            desc = f"Mükafat: {prize}" if prize else "Beynəlxalq online hackathon"

            if is_expired(deadline_text):
                continue

            results.append({
                "title": title[:120],
                "url": href,
                "description": desc[:300],
                "deadline": deadline_text[:100],
                "trusted": True,
            })
        log.info(f"Devpost: {len(results)} nəticə")
    except Exception as e:
        log.warning(f"Devpost error: {e}")
    return results


def scrape_mlh() -> list[dict]:
    results = []
    try:
        r = requests.get("https://mlh.io/seasons/2026/events", headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        for ev in soup.select(".event")[:10]:
            name_el = ev.select_one(".event-name h3") or ev.select_one("h3")
            link_el = ev.select_one("a.event-link") or ev.select_one("a")
            date_el = ev.select_one(".event-date")

            if not name_el or not link_el:
                continue

            title = name_el.get_text(strip=True)
            href = link_el.get("href", "")
            deadline_text = date_el.get_text(strip=True) if date_el else ""

            if is_expired(deadline_text):
                continue

            results.append({
                "title": title[:120],
                "url": href,
                "description": "MLH tərəfindən dəstəklənən hackathon",
                "deadline": deadline_text[:100],
                "trusted": True,
            })
        log.info(f"MLH: {len(results)} nəticə")
    except Exception as e:
        log.warning(f"MLH error: {e}")
    return results


RELEVANCE_KW = [
    "hackathon", "hakaton", "yarış", "müsabiqə", "competition",
    "challenge", "startup", "olimpiada", "grant", "bootcamp",
    "ideathon", "datathon", "olympiad", "innovation",
]


def scrape_edumap() -> list[dict]:
    results = []
    pages = [
        "https://edumap.az/musabiqeler",
        "https://edumap.az/kateqoriya/tedbirler",
    ]
    seen = set(pages)

    for page_url in pages:
        try:
            r = requests.get(page_url, headers=HEADERS, timeout=12)
            soup = BeautifulSoup(r.text, "lxml")

            for a in soup.find_all("a", href=True):
                text = a.get_text(strip=True)
                href = a["href"]
                if not text or len(text) < 8:
                    continue
                if not any(kw in text.lower() for kw in RELEVANCE_KW):
                    continue

                if href.startswith("/") and "/" not in href[1:]:
                    full = "https://edumap.az" + href
                elif href.startswith("http"):
                    full = href
                else:
                    continue

                if full in seen:
                    continue
                seen.add(full)

                deadline_str = ""
                desc = ""
                try:
                    ar = requests.get(full, headers=HEADERS, timeout=8)
                    asoup = BeautifulSoup(ar.text, "lxml")
                    body = asoup.get_text(" ", strip=True)[:2000]
                    dt = parse_deadline(body)
                    if dt:
                        if dt < TODAY:
                            continue
                        deadline_str = dt.strftime("%d.%m.%Y")
                    desc_el = (asoup.find("meta", {"name": "description"}) or
                               asoup.find("meta", property="og:description"))
                    desc = desc_el.get("content", "").strip() if desc_el else ""
                except Exception:
                    pass

                results.append({
                    "title": text[:120],
                    "url": full,
                    "description": desc[:300],
                    "deadline": deadline_str,
                    "trusted": True,
                })
                time.sleep(0.5)

        except Exception as e:
            log.warning(f"Edumap error {page_url}: {e}")

    log.info(f"Edumap: {len(results)} nəticə")
    return results


def scrape_hackathons() -> list[dict]:
    seen: set[str] = set()
    all_items: list[dict] = []

    for item in scrape_devpost() + scrape_mlh() + scrape_edumap():
        if item["url"] not in seen:
            seen.add(item["url"])
            all_items.append(item)

    all_items.sort(key=lambda x: (not x["trusted"], x["title"].lower()))
    log.info(f"Cəmi {len(all_items)} unikal nəticə")
    return all_items
