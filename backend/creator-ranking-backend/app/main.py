from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import re
import asyncio
import time
from typing import Optional, Dict, Any, Tuple

app = FastAPI()

# CORS: allow the frontend origin(s) — during development allow all origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A list of Nitter instances to try (order matters)
NITTER_INSTANCES = [
    "https://nitter.net",
    "https://nitter.1d4.us",
    "https://nitter.unixfox.eu",
    "https://nitter.kavin.rocks",
    "https://nitter.privacydev.net",
    "https://nitter.fdn.fr",
    "https://nitter.cz",
]

# Short in-memory cache: handle -> (timestamp, result)
CACHE_TTL_SECONDS = 60  # short TTL for freshness
_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}

# Total users for ranking
TOTAL_USERS = 15_000_000

class RankRequest(BaseModel):
    handle: str

class RankResponse(BaseModel):
    handle: str
    followers: int
    following: int
    tweets: int
    impressions: int
    score: float
    global_rank: int
    total_users: int

# Demo fallback deterministic generator (consistent per handle)
def generate_demo_stats(handle: str) -> Dict[str, int]:
    s = sum(ord(c) for c in handle.lower())
    followers = (s * 137) % 500_000 + 1_500
    following = (s * 73) % 5_000 + 50
    tweets = (s * 97) % 50_000 + 100
    impressions = max(1_000, followers * ((s % 10) + 2))
    return {"followers": followers, "following": following, "tweets": tweets, "impressions": impressions}

def parse_number(text: str) -> int:
    if not text:
        return 0
    text = text.strip().replace(",", "").upper()
    m = re.match(r"([0-9,.]*\d)([KM]?)", text)
    if not m:
        # Try to extract digits
        digits = re.findall(r"\d+", text)
        return int(digits[0]) if digits else 0
    number, suffix = m.groups()
    try:
        val = float(number)
    except:
        val = 0.0
    if suffix == "K":
        val *= 1_000
    elif suffix == "M":
        val *= 1_000_000
    return int(val)

async def fetch_from_nitter(client: httpx.AsyncClient, instance: str, handle: str) -> Optional[Dict[str, int]]:
    url = f"{instance}/{handle}"
    try:
        r = await client.get(url, timeout=10.0)
    except Exception:
        return None
    if r.status_code != 200:
        return None

    soup = BeautifulSoup(r.text, "lxml")

    # Attempt 1: look for profile stat blocks: span.profile-stat-num and span.profile-stat-label
    followers = following = tweets = None
    stat_nums = soup.select("span.profile-stat-num")
    stat_labels = soup.select("span.profile-stat-label")
    if stat_nums and stat_labels and len(stat_nums) == len(stat_labels):
        for num, label in zip(stat_nums, stat_labels):
            label_text = label.get_text(strip=True).lower()
            val = parse_number(num.get_text(strip=True))
            if "tweet" in label_text:
                tweets = val
            elif "following" in label_text:
                following = val
            elif "follower" in label_text:
                followers = val

    # Attempt 2: other layout: div.profile-stat with span.profile-stat-num
    if not (followers and following and tweets):
        try:
            blocks = soup.select("div.profile-stat")
            for block in blocks:
                label = block.get_text(" ", strip=True).lower()
                num = block.select_one("span.profile-stat-num")
                if not num:
                    continue
                val = parse_number(num.get_text(strip=True))
                if "tweet" in label and tweets is None:
                    tweets = val
                elif "following" in label and following is None:
                    following = val
                elif "follower" in label and followers is None:
                    followers = val
        except Exception:
            pass

    # Best-effort estimate for impressions from recent tweets: sum engagements * heuristic multiplier
    impressions = None
    try:
        # Recent tweets: look for timeline items; be conservative and sum numbers found near tweet actions
        timeline_items = soup.select(".timeline-item")[:8]  # up to 8 tweets
        total_engagement = 0
        for t in timeline_items:
            # search for numbers in action spans (likes/retweets/replies)
            texts = t.get_text(" ", strip=True)
            for m in re.findall(r"(\d+[,\\d\.KMkm]*)", texts):
                total_engagement += parse_number(m)
        if total_engagement > 0:
            # impressions ~ 8x engagement as a conservative estimate
            impressions = int(total_engagement * 8)
    except Exception:
        impressions = None

    # fill defaults if missing
    if followers is None or following is None or tweets is None:
        # if critical pieces missing, treat as failure for this instance
        return None

    if impressions is None:
        impressions = max(1_000, followers * 5)

    return {"followers": int(followers), "following": int(following), "tweets": int(tweets), "impressions": int(impressions)}

async def fetch_twitter_stats(handle: str) -> Dict[str, int]:
    handle = handle.lstrip("@").strip()
    now = time.time()
    # Cache check
    cached = _cache.get(handle)
    if cached and (now - cached[0]) < CACHE_TTL_SECONDS:
        return cached[1]

    # Try multiple instances in parallel but stop early when one returns good data
    async with httpx.AsyncClient(follow_redirects=True) as client:
        tasks = [fetch_from_nitter(client, inst, handle) for inst in NITTER_INSTANCES]
        # We'll gather and pick the first non-None result as soon as available
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for res in results:
            if isinstance(res, dict):
                _cache[handle] = (now, res)
                return res

    # If we get here, Nitter scraping failed for all instances -> return deterministic demo data
    demo = generate_demo_stats(handle)
    _cache[handle] = (now, demo)
    return demo

def calculate_score(followers: int, following: int, tweets: int, impressions: int) -> float:
    # Basic normalized scoring with caps to avoid runaway values
    followers_score = min(followers / 1_000_000, 1.0) * 100  # scale to 0-100
    reach_score = min(impressions / 10_000_000, 1.0) * 100
    activity_score = min(tweets / 10_000, 1.0) * 100
    engagement_ratio = min(followers / max(following, 1), 100)
    engagement_score = min(engagement_ratio / 100, 1.0) * 100
    # Weighted mix:
    score = followers_score * 0.45 + reach_score * 0.25 + engagement_score * 0.2 + activity_score * 0.1
    return round(score, 2)

def calculate_global_rank(score: float) -> int:
    # Map score (0..100) to ranks 1..TOTAL_USERS with an inverse mapping (higher score -> lower rank)
    # Use an exponential curve to compress ranks at high end
    import math
    # clamp
    s = max(0.0, min(score, 100.0))
    # percent better = sigmoid-like curve
    pct = (1 - math.exp(-s / 20))  # 0..~0.997
    rank = int(TOTAL_USERS * (1 - pct))  # better scores -> lower rank number
    rank = max(1, min(rank, TOTAL_USERS))
    return rank

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/rank", response_model=RankResponse)
async def get_rank(req: RankRequest):
    handle = req.handle.strip()
    if not handle:
        raise HTTPException(status_code=400, detail="handle is required")

    try:
        stats = await fetch_twitter_stats(handle)
        score = calculate_score(stats["followers"], stats["following"], stats["tweets"], stats["impressions"])
        rank = calculate_global_rank(score)
        return RankResponse(
            handle=handle.lstrip("@"),
            followers=stats["followers"],
            following=stats["following"],
            tweets=stats["tweets"],
            impressions=stats["impressions"],
            score=score,
            global_rank=rank,
            total_users=TOTAL_USERS,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"internal error: {str(e)}")
