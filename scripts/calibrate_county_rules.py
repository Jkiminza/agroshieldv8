#!/usr/bin/env python3
"""Calibrate county trigger/exit/premium from historical CHIRPS rainfall.

Usage:
    python3 scripts/calibrate_county_rules.py Kitui Nakuru Kisumu
    python3 scripts/calibrate_county_rules.py --apply Kitui Nakuru Kisumu
"""
import argparse
import json
import os
import sys
import time
import datetime
from pathlib import Path
import climateserv
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np

CACHE_DIR = Path(__file__).resolve().parent / ".cache"
FIRST_YEAR = 1991
LAST_FETCH_YEAR = 2026  # fetch through 2026 so cross-year windows ending in 2026 are covered
POLYGON_BUFFER = 0.1  # degrees around county centroid (~11km); polygon is a square bbox


def get_db_conn(database_url):
    if not database_url:
        database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)
    # psycopg2 accepts URL but channel_binding/set ssl params; strip unsupported
    return psycopg2.connect(database_url)


def county_rules(conn, names):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    out = {}
    for name in names:
        cur.execute("""SELECT c.id, c.name, c.lat, c.lon, cr.id, cr.trigger_mm, cr.exit_mm,
                      cr.season_start, cr.season_end, cr.coverage_days, cr.premium_rate, cr.notes
                      FROM counties c LEFT JOIN county_rules cr ON cr.county_id = c.id AND cr.active = TRUE
                      WHERE lower(c.name) = lower(%s)""", (name,))
        r = cur.fetchone()
        if not r:
            print(f"WARNING: county '{name}' not found in DB", file=sys.stderr)
            continue
        out[name] = r
    cur.close()
    return out


def fetch_chirps_requests(lat, lon, year):
    buf = POLYGON_BUFFER
    poly = [[lon - buf, lat - buf], [lon + buf, lat - buf],
            [lon + buf, lat + buf], [lon - buf, lat + buf],
            [lon - buf, lat - buf]]
    geometry_coords = json.dumps(poly)
    begin = f"01/01/{year}"
    end = f"12/31/{year}"
    last_err = None
    for attempt in range(1, 4):
        try:
            res = climateserv.request_data(
                data_set_type=0,
                operation_type="Average",
                earliest_date=begin,
                latest_date=end,
                geometry_coords=geometry_coords,
                seasonal_ensemble=None,
                seasonal_variable=None,
                outfile="memory_object",
            )
            if res and isinstance(res, dict) and 'data' in res:
                return res
            raise RuntimeError("empty/none result")
        except Exception as e:
            last_err = e
            print(f"  attempt {attempt}/3 failed: {e}", file=sys.stderr)
            time.sleep(2 ** attempt)
    raise RuntimeError(f"failed after retries: {last_err}")


def load_or_fetch(county, lat, lon, first, last):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    slug = county.lower().replace(" ", "_")
    cache = CACHE_DIR / f"chirps_{slug}_{first}_{last}.json"
    if cache.exists():
        try:
            data = json.loads(cache.read_text())
            if data.get("county") == county and isinstance(data.get("records"), list):
                print(f"{county}: cache hit ({len(data['records'])} records)", file=sys.stderr)
                return data
        except Exception as e:
            print(f"{county}: cache corrupt ({e}), refetching", file=sys.stderr)
    # fetch
    records = []
    for yr in range(first, last + 1):
        print(f"{county}: fetching {yr} ...", file=sys.stderr)
        res = fetch_chirps_requests(lat, lon, yr)
        for g in res["data"]:
            v = g.get("value", {})
            val = v.get("avg", None)
            if val is None: val = g.get("raw_value")
            d = g.get("date")
            # ISO date MM/DD/YYYY -> YYYY-MM-DD
            try:
                dt = datetime.datetime.strptime(d, "%m/%d/%Y").date()
            except Exception:
                try:
                    dt = datetime.date(*[int(p) for p in d.split('/')[:3][::-1]])
                except Exception:
                    continue
            records.append({"date": dt.isoformat(), "value": val})
    data = {"county": county, "lat": lat, "lon": lon, "first": first, "last": last,
            "buffer": POLYGON_BUFFER, "records": records}
    cache.write_text(json.dumps(data))
    print(f"{county}: cached {len(records)} records", file=sys.stderr)
    return data


def parse_date(s):
    if hasattr(s, "year") and hasattr(s, "month") and hasattr(s, "day"):
        return s  # already date/datetime
    s = str(s)
    # handle 'YYYY-MM-DD' or timestamp strings
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.datetime.strptime(s[:10], fmt).date() if False else datetime.datetime.strptime(s[:10], fmt).date() if False else None
        except Exception:
            pass
    # fallback
    return datetime.datetime.fromisoformat(str(s)[:10]).date()


# clean parse_date
def pd(s):
    if hasattr(s, "year") and hasattr(s, "month") and hasattr(s, "day"):
        return s
    return datetime.datetime.fromisoformat(str(s)[:10]).date()


def seasonal_total(records_by_date, start_md, coverage_days, year):
    sm, sd = start_md
    start = datetime.date(year, sm, sd)
    end = start + datetime.timedelta(days=coverage_days - 1)
    total = 0.0
    present = 0
    expected = coverage_days
    d = start
    while d <= end:
        v = records_by_date.get(d.isoformat())
        if v is not None:
            total += float(v)
            present += 1
        d += datetime.timedelta(days=1)
    if present < 0.8 * expected:
        return None
    return total, int((start.year != end.year))


def linear_payout_rate(totals, trigger, exit):
    if trigger <= exit:
        return 0.0
    rates = []
    for r in totals:
        if r >= trigger:
            rates.append(0.0)
        elif r <= exit:
            rates.append(1.0)
        else:
            rates.append((trigger - r) / (trigger - exit))
    return (sum(rates) / len(rates)) if rates else 0.0


def percentiles(arr, ps):
    arr = sorted(arr)
    n = len(arr)
    out = []
    for p in ps:
        if n == 0:
            out.append(float('nan'))
            continue
        # numpy percentile (linear interpolation)
        out.append(float(np.percentile(np.array(arr, dtype=float), p)))
    return out


def main():
    parser = argparse.ArgumentParser(description="Calibrate county rules using CHIRPS 1991-2025")
    parser.add_argument("counties", nargs="+", help="County names (must exist in counties DB or use --latlon?)")
    parser.add_argument("--apply", action="store_true", help="Write suggested values back to county_rules")
    parser.add_argument("--no-cache", action="store_true", help="Ignore cache and refetch")
    args = parser.parse_args()

    conn = get_db_conn(None)
    info = county_rules(conn, args.counties)

    results = []
    for name, row in info.items():
        county_id = row['id']
        county_name = row['name']
        lat = row['lat']
        lon = row['lon']
        rule_id = row['id_1'] if 'id_1' in row else None
        trigger = row.get('trigger_mm  ')
        if trigger is None: trigger = row.get('trigger_mm')
        exitv = row.get('exit_mm')
        season_start = row.get('season_start')
        season_end = row.get('season_end')
        cov_days = row.get('coverage_days')
        prem_rate = row.get('premium_rate')
        if lat is None or lon is None:
            print(f"{name}: no coordinates in DB, skipping", file=sys.stderr)
            continue
        lat = float(lat); lon = float(lon)
        if season_start is None:
            print(f"{name}: missing season_start rule; using 03/01", file=sys.stderr)
            season_start = datetime.date(2026, 3, 1)
        if cov_days is None:
            print(f"{name}: missing coverage_days; using 120", file=sys.stderr)
            cov_days = 120
        ss = pd(season_start)
        start_md = (ss.month, ss.day)
        # keep coverage_days for use
        coverage_days = cov_days

        # clear cache if requested
        slug = name.lower().replace(" ", "_")
        cache = CACHE_DIR / f"chirps_{slug}_{FIRST_YEAR}_{LAST_FETCH_YEAR}.json"
        if args.no_cache and cache.exists():
            cache.unlink()

        data = load_or_fetch(name, lat, lon, FIRST_YEAR, LAST_FETCH_YEAR)
        by_date = {r["date"]: r["value"] for r in data["records"]}

        # collect seasonal totals for years 1991..2025
        years = []
        totals = []
        cross = 0
        for y in range(FIRST_YEAR, 2026):
            res = seasonal_total(by_date, start_md, coverage_days, y)
            if res is None:
                continue
            total, crossed = res
            years.append(y)
            totals.append(total)
            if crossed: cross += 1

        if len(totals) == 0:
            print(f"{name}: no seasonal totals", file=sys.stderr)
            continue

        p5, p10, p20, p50 = percentiles(totals, [5, 10, 20, 50])
        # expected payout rate using county_rules trigger/exit if available
        t_use = int(trigger) if trigger is not None else int(round(p20))
        e_use = int(exitv) if exitv is not None else int(round(p10))
        rate = linear_payout_rate(totals, t_use, e_use)
        suggested_premium = rate * 1.3

        results.append({
            "county": name,
            "years": len(totals),
            "cross": cross,
            "p5": p5,
            "p10": p10,
            "p20": p20,
            "p50": p50,
            "trigger_rule": t_use,
            "exit_rule": e_use,
            "suggested_trigger": int(round(p20)),
            "suggested_exit": int(round(p10)),
            "expected_rate": rate,
            "suggested_premium_rate": suggested_premium,
            "rule_id": rule_id,
            "county_id": county_id,
        })

    # Print table
    header = f"{'County':<22}{'Years':>6}{'P5':>10}{'P10':>10}{'P20(trigger)':>16}{'P50':>10}{'ExpRate':>10}{'PremiumRate':>14}"
    print("\n" + header)
    print("-" * len(header))
    for r in results:
        print(f"{r['county']:<22}{r['years']:>6}{r['p5']:>10.1f}{r['p10']:>10.1f}{r['p20']:>16.1f}{r['p50']:>10.1f}{r['expected_rate']:>10.4f}{r['suggested_premium_rate']:>14.5f}")

    print("\nSuggested (rounded): trigger=p20, exit=p10, premium_rate=expected_payout_rate*1.3")
    for r in results:
        print(f"  {r['county']}: trigger={r['suggested_trigger']} mm, exit={r['suggested_exit']} mm, "
              f"rate={r['suggested_premium_rate']:.5f}  (cross-year windows: {r['cross']})")

    if args.apply:
        print("\n--apply: updating county_rules ...")
        cur = conn.cursor(cursor_factory=RealDictCursor)
        for r in results:
            cur.execute("""UPDATE county_rules
                           SET trigger_mm=%s, exit_mm=%s, premium_rate=%s,
                               notes=%s, updated_at=NOW()
                           WHERE id=%s""",
                        (r["suggested_trigger"], r["suggested_exit"],
                         round(r["suggested_premium_rate"], 5),
                         "CHIRPS 1991-2025, p20 trigger",
                         r["rule_id"]))
            conn.commit()
            print(f"  updated rule {r['rule_id']} for {r['county']}")
        cur.close()
    else:
        print("\nDry run only. Re-run with --apply to write to DB.")

    conn.close()

if __name__ == "__main__":
    main()
