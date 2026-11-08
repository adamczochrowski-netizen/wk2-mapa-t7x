"""Moje Wirkowice — planowane wyłączenia prądu (PGE Dystrybucja) i komunikaty o wodzie (GPGK Izbica, Gmina Izbica).
Zapisuje wylaczenia.json obok apki. Uruchamia go akcja GitHub co 30 minut (razem z wiadomościami);
lokalnie do testów: python github/wylaczenia.py DO_WRZUCENIA_NA_GITHUB
"""
import json, re, sys, html, pathlib, datetime, urllib.request, urllib.parse, email.utils
import xml.etree.ElementTree as ET

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".") / "wylaczenia.json"
UA = {"User-Agent": "MojeWirkowice/1.0 (+https://adamczochrowski-netizen.github.io/wk2-mapa-t7x/)"}
# Gminy w promieniu ok. 20 km od Wirkowic (nazwy gmin z rejestru TERYT, tak jak podaje PGE)
GMINY = {"Izbica", "Krasnystaw", "Gorzków", "Rudnik", "Żółkiewka", "Siennica Różana", "Kraśniczyn",
         "Stary Zamość", "Nielisz", "Sułów", "Zamość", "Skierbieszów", "Łopiennik Górny"}
POWIATY = {"krasnostawski", "zamojski", "Zamość"}

def pobierz(url, t=20):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t).read()

teraz = datetime.datetime.now()
wynik = {"zaktualizowano": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "prad": [], "woda": []}

# --- Prąd: PGE Dystrybucja (to samo źródło co mapa na pgedystrybucja.pl) ---
try:
    q = urllib.parse.urlencode({"stopAtFrom": teraz.strftime("%Y-%m-%d 00:00:00"),
                                "startAtTo": (teraz + datetime.timedelta(days=14)).strftime("%Y-%m-%d 23:59:59")})
    dane = json.loads(pobierz("https://power-outage.gkpge.pl/api/power-outage?" + q, 30))
    for x in dane:
        adr = [a["teryt"] for a in (x.get("addresses") or []) if a.get("teryt")]
        nasze = [a for a in adr if a.get("communeName") in GMINY and a.get("countyName") in POWIATY]
        if not nasze: continue
        miejsca = sorted({a["cityName"] for a in nasze})
        gminy = sorted({a["communeName"] for a in nasze})
        for zakres in (x.get("dateRanges") or [{"startAt": x["startAt"], "stopAt": x["stopAt"]}]):
            wynik["prad"].append({"od": zakres["startAt"], "do": zakres["stopAt"], "gminy": gminy, "miejsca": miejsca,
                                  "opis": (x.get("description") or "")[:400], "odwolane": bool(x.get("revoked"))})
    wynik["prad"].sort(key=lambda w: w["od"])
except Exception as e:
    print("PGE: nie udało się", e); wynik["blad_prad"] = True

# --- Woda: komunikaty z ostatnich 3 tygodni (RSS wodociągów i gminy) ---
WODA = re.compile(r"wod[ayzęo]|wodoci|przerw\w* w dostawie|awari", re.I)
for zrodlo, url in [("GPGK Izbica", "https://www.gpgkizbica.pl/feed/"), ("Gmina Izbica", "https://www.gminaizbica.pl/feed/")]:
    try:
        for it in ET.fromstring(pobierz(url)).iter("item"):
            tyt = " ".join((it.findtext("title") or "").split())
            opis = re.sub(r"<[^>]+>", " ", html.unescape(it.findtext("description") or ""))
            opis = " ".join(opis.split()).replace(" [&#8230;]", "…").replace("[…]", "…")
            tekst = tyt + " " + opis
            if not WODA.search(tekst) or re.search(r"taryf|regulamin|odbiór popiołu|ścieków na okres", tekst, re.I): continue
            try: d = email.utils.parsedate_to_datetime(it.findtext("pubDate")).astimezone()
            except Exception: continue
            if (datetime.datetime.now().astimezone() - d).days > 21: continue
            wynik["woda"].append({"t": tyt[:160], "opis": opis[:300], "l": (it.findtext("link") or "").strip(),
                                  "d": d.isoformat(timespec="minutes"), "z": zrodlo})
    except Exception as e:
        print("Woda:", zrodlo, "nie udało się", e)
wynik["woda"].sort(key=lambda w: w["d"], reverse=True)

OUT.write_text(json.dumps(wynik, ensure_ascii=False, indent=0), encoding="utf-8")
print("prąd:", len(wynik["prad"]), "woda:", len(wynik["woda"]))
