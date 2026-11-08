// Moje Wirkowice — praca bez internetu.
// Strony i skrypty: od razu z pamięci telefonu (szybko), a w tle pobiera się świeża wersja na następny raz.
// Nowe wydanie apki i tak dociera od razu: zmienia się WERSJA, więc telefon pobiera cały komplet od nowa.
// Czcionki i ikony: z pamięci (rzadko się zmieniają).
// WERSJA zmienia się automatycznie przy każdym budowaniu (zbuduj.sh), co odświeża pamięć w telefonach.
const WERSJA = "592e1a494b";
const CACHE = "wirkowice-" + WERSJA;
const PLIKI = ["./", "index.html", "historia.html", "miejsca.html", "kosciol.html", "parafia.html",
  "cmentarz.html", "alarmowe.html", "co-slychac.html", "smieci.html", "notatki.html", "zdrowie.html", "o-wirkowicach.html", "urzedowe.html", "wiadomosci.html", "wspolne.css", "dane.js", "godziny.js", "ustawienia.js", "manifest.json", "ikona-192.png", "ikona-512.png", "ikona-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("wirkowice-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !font) return;      // np. Google Maps — zostawiamy przeglądarce
  if (url.pathname.endsWith("wiadomosci.json")) return;
  if (/\.mp4$/.test(url.pathname)) return;   // filmy: przeglądarka sama (wczytuje je kawałkami)   // nagłówki: zawsze świeże z sieci (strona sama prosi o no-store)
  if (font || /\.(png|jpg|css|json)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  // cache:"no-cache" = przy pobieraniu w tle pytamy serwer o świeżą wersję (GitHub każe przeglądarce trzymać pliki 10 minut)
  const zSieci = fetch(req, {cache: "no-cache"}).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => {
    if (hit) { e.waitUntil(zSieci.catch(() => {})); return hit; }   // z pamięci od razu, odświeżenie w tle
    return zSieci.catch(() => caches.match("index.html"));
  }));
});
