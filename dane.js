// Moje Wirkowice — dane z Arkusza Google.
// Jak podłączyć: w arkuszu Udostępnij → „Każda osoba mająca link” → Przeglądający, potem wpisz tu ID arkusza
// (to długi ciąg liter między /d/ a /edit w adresie arkusza). Dopóki ARKUSZ_ID jest pusty, apka pokazuje PRZYKŁADY.
const ARKUSZ_ID = "";

// Karty arkusza i ich kolumny (pierwszy wiersz arkusza = nagłówki, dokładnie takie jak tu):
//  Ogloszenia:  data | tytul | tresc | wazne_do
//  Wydarzenia:  data | godzina | nazwa | miejsce | opis
//  Smieci:      data | rodzaj
//  Miejsca:     nazwa | wies | opis | wspolrzedne
//  Kontakty:    nazwa | telefon | opis
//  Parafia:     pole | tresc
//  Historia:    rok | tytul | tresc | zdjecia | podpis | autor
//               zdjecia = link(i) do zdjęć z Dysku Google („Każda osoba mająca link”), kilka linków oddziel spacją

const PRZYKLADY = {
  Ogloszenia: [
    {data:"2026-11-03", tytul:"PRZYKŁAD: Zebranie wiejskie", tresc:"Tak będzie wyglądać ogłoszenie sołectwa: data, tytuł i treść. Podmień je w arkuszu na prawdziwe.", wazne_do:""},
    {data:"2026-10-28", tytul:"PRZYKŁAD: Przerwa w dostawie prądu", tresc:"Ogłoszenia z ustawioną datą „ważne do” znikają same, gdy minie ten dzień.", wazne_do:"2026-12-31"},
  ],
  Wydarzenia: [
    {data:"2026-12-06", godzina:"16:00", nazwa:"PRZYKŁAD: Mikołajki dla dzieci", miejsce:"świetlica", opis:"Przykładowe wydarzenie. Każde ma przycisk dodania do kalendarza w telefonie."},
  ],
  Smieci: [
    {data:"2026-11-10", rodzaj:"zmieszane"}, {data:"2026-11-17", rodzaj:"plastik i metale"},
    {data:"2026-11-24", rodzaj:"papier"}, {data:"2026-12-01", rodzaj:"zmieszane"},
    {data:"2026-12-08", rodzaj:"szkło"}, {data:"2026-12-15", rodzaj:"bio"},
  ],
  Miejsca: [],
  Kontakty: [],
  Parafia: [],
  Historia: [
    {rok:"ok. 1900", tytul:"PRZYKŁAD: Najstarsze wzmianki", tresc:"Tak będzie wyglądał wpis w historii wsi: rok, tytuł i opis. Wpisy układają się same od najstarszego.", zdjecia:"", podpis:"", autor:""},
    {rok:"lata 60.", tytul:"PRZYKŁAD: Wpis ze zdjęciem", tresc:"Do wpisu można dodać jedno albo kilka zdjęć z Dysku Google. Dotknięcie zdjęcia otwiera je w powiększeniu.", zdjecia:"", podpis:"Podpis zdjęcia: kto, gdzie, kiedy", autor:"Imię osoby, która przekazała zdjęcie"},
  ],
};

// Link do zdjęcia → adres obrazka. Rozumie linki z Dysku Google (…/file/d/ID/…, …?id=ID) i zwykłe adresy obrazków.
function obrazek(link, szer=1600){
  const s=String(link||"").trim(); if(!s) return null;
  const m=/\/d\/([\w-]{20,})/.exec(s)||/[?&]id=([\w-]{20,})/.exec(s);
  if(m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${szer}`;
  return /^https?:\/\//.test(s) ? s : null;
}

// --- odczyt CSV (z obsługą cudzysłowów) ---
function parseCSV(t){
  const rows=[]; let row=[], f="", q=false;
  for(let i=0;i<t.length;i++){ const c=t[i];
    if(q){ if(c==='"'){ if(t[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===','){ row.push(f); f=""; }
    else if(c==='\n'){ row.push(f); rows.push(row); row=[]; f=""; } else if(c!=='\r') f+=c; }
  if(f!==""||row.length){ row.push(f); rows.push(row); }
  if(!rows.length) return [];
  const head=rows[0].map(h=>h.trim().toLowerCase());
  return rows.slice(1).filter(r=>r.some(x=>x.trim()!=="")).map(r=>Object.fromEntries(head.map((h,i)=>[h,(r[i]||"").trim()])));
}

// Zwraca {wiersze, przyklad:true/false, zapisane:true/false}. Bez internetu: ostatnia zapisana kopia.
async function wczytaj(karta){
  if(!ARKUSZ_ID) return {wiersze:PRZYKLADY[karta]||[], przyklad:true};
  const klucz="wirk-"+karta;
  try{
    const url=`https://docs.google.com/spreadsheets/d/${ARKUSZ_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(karta)}`;
    const res=await fetch(url,{cache:"no-store"}); if(!res.ok) throw new Error(res.status);
    const wiersze=parseCSV(await res.text());
    try{ localStorage.setItem(klucz,JSON.stringify(wiersze)); }catch(e){}
    return {wiersze, przyklad:false};
  }catch(e){
    try{ const z=JSON.parse(localStorage.getItem(klucz)||"null"); if(z) return {wiersze:z, przyklad:false, zapisane:true}; }catch(_){}
    return {wiersze:[], przyklad:false, blad:true};
  }
}

// --- daty: "2026-11-10", "10.11.2026", "10/11/2026", "10.11.2026 0:00:00" ---
function data(s){
  if(!s) return null; s=String(s).trim();
  let m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if(m) return new Date(+m[1],+m[2]-1,+m[3]);
  m=/^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(s); if(m) return new Date(+m[3],+m[2]-1,+m[1]);
  return null;
}
const DNI=["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"];
const MIES=["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
const dzis=()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; };
const ladnaData=d=>`${d.getDate()} ${MIES[d.getMonth()]}`;
function kiedy(d){
  const n=Math.round((d-dzis())/864e5);
  if(n===0) return "dziś"; if(n===1) return "jutro"; if(n===-1) return "wczoraj";
  if(n>1&&n<7) return DNI[d.getDay()]+", "+ladnaData(d);
  return ladnaData(d)+(d.getFullYear()!==dzis().getFullYear()?" "+d.getFullYear():"");
}
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const notkaPrzyklad='<p style="margin:0 0 10px;padding:8px 12px;border-radius:10px;background:var(--accent-soft);color:var(--fg);font-size:14px"><strong style="color:var(--accent)">Przykładowe dane.</strong> Prawdziwe pojawią się po podłączeniu arkusza.</p>';
