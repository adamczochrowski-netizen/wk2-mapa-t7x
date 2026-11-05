// Moje Wirkowice — praca bez internetu.
// Strony: najpierw sieć (żeby zawsze była najnowsza wersja), a bez zasięgu — zapisana kopia.
// Czcionki i ikony: z pamięci (rzadko się zmieniają).
// WERSJA zmienia się automatycznie przy każdym budowaniu (zbuduj.sh), co odświeża pamięć w telefonach.
const WERSJA = "e446a4b4eb";
const CACHE = "wirkowice-" + WERSJA;
const PLIKI = ["./", "index.html", "historia.html", "miejsca.html", "kosciol.html", "parafia.html",
  "cmentarz.html", "alarmowe.html", "co-slychac.html", "smieci.html", "notatki.html", "wspolne.css", "dane.js", "ustawienia.js", "manifest.json", "ikona-192.png", "ikona-512.png", "ikona-180.png"];

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
  if (font || /\.(png|css|json)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  // cache:"no-cache" = zawsze zapytaj serwer o świeżą wersję (GitHub każe przeglądarce trzymać pliki 10 minut)
  e.respondWith(fetch(req, {cache: "no-cache"}).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match("index.html"))));
});
