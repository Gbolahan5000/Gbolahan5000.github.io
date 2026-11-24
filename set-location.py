#!/usr/bin/env python3
"""Change the location shown on the portfolio, everywhere at once.

Usage:
    python3 set-location.py "Abuja, Nigeria"
    python3 set-location.py "Nairobi, Kenya"
    python3 set-location.py "Accra, Ghana" --code GH     (only needed for countries not in the list below)

It updates every .html page and llms.txt (visible text, page titles, descriptions
and the structured data Google reads), records the new place in site-settings.json,
and refreshes the sitemap date. Then commit and push the changes.
"""
import glob, json, re, sys, datetime, os

CODES = {"nigeria": "NG", "ghana": "GH", "kenya": "KE", "south africa": "ZA", "united kingdom": "GB",
         "uk": "GB", "united states": "US", "usa": "US", "canada": "CA", "germany": "DE", "ireland": "IE",
         "united arab emirates": "AE", "uae": "AE", "rwanda": "RW", "egypt": "EG", "netherlands": "NL"}

here = os.path.dirname(os.path.abspath(__file__))
os.chdir(here)

args = [a for a in sys.argv[1:]]
code = None
if "--code" in args:
    i = args.index("--code")
    code = args[i + 1].upper()
    del args[i:i + 2]
if len(args) != 1 or not args[0].strip():
    sys.exit(__doc__)

parts = [p.strip() for p in args[0].rsplit(",", 1)]
settings = json.load(open("site-settings.json", encoding="utf-8"))
new_city = parts[0]
new_country = parts[1] if len(parts) == 2 else settings["country"]
new_code = code or (CODES.get(new_country.lower()) if new_country != settings["country"] else settings["country_code"])
if not new_code:
    sys.exit(f'I don\'t know the country code for "{new_country}". Add it, e.g.: --code GH')

old_city, old_country, old_code = settings["city"], settings["country"], settings["country_code"]
old_full, new_full = f"{old_city}, {old_country}", f"{new_city}, {new_country}"
if old_full == new_full:
    sys.exit(f"Already set to {new_full}. Nothing to do.")

files = glob.glob("**/*.html", recursive=True) + ["llms.txt"]
total = 0
for f in files:
    s = open(f, encoding="utf-8").read()
    t = s.replace(old_full, new_full)
    t = re.sub(r"\b" + re.escape(old_city) + r"\b", new_city, t)
    t = t.replace(f'"addressCountry": "{old_code}"', f'"addressCountry": "{new_code}"')
    if t != s:
        open(f, "w", encoding="utf-8").write(t)
        total += 1
        print("updated", f)

if os.path.exists("sitemap.xml"):
    sm = open("sitemap.xml", encoding="utf-8").read()
    sm = re.sub(r"<lastmod>[^<]*</lastmod>", f"<lastmod>{datetime.date.today().isoformat()}</lastmod>", sm)
    open("sitemap.xml", "w", encoding="utf-8").write(sm)

settings.update(city=new_city, country=new_country, country_code=new_code)
json.dump(settings, open("site-settings.json", "w", encoding="utf-8"), indent=2)
open("site-settings.json", "a").write("\n")
print(f"\nLocation changed: {old_full} -> {new_full} ({total} files). Now commit and push.")
