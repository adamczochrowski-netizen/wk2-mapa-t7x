// Moje Wirkowice — dane z Arkusza Google.
// Jak podłączyć: w arkuszu Udostępnij → „Każda osoba mająca link” → Przeglądający, potem wpisz tu ID arkusza
// (to długi ciąg liter między /d/ a /edit w adresie arkusza). Dopóki ARKUSZ_ID jest pusty, apka pokazuje PRZYKŁADY.
const ARKUSZ_ID = "1hY7dNrD_iAFz41AtFXqxKMPjETiMcxb7r6rrIa-BG8s";

// Karty arkusza i ich kolumny (pierwszy wiersz arkusza = nagłówki, dokładnie takie jak tu):
//  Ogloszenia:  data | tytul | tresc | wazne_do
//  Wydarzenia:  data | godzina | nazwa | miejsce | opis
//  Smieci:      data | rodzaj
//  Miejsca:     nazwa | wies | opis | wspolrzedne
//  Kontakty:    nazwa | telefon | opis
//  Parafia:     pole | tresc
//  Historia:    rok | tytul | tresc | zdjecia | podpis | autor | zrodlo   (zrodlo = link do źródła, opcjonalnie)
//               zdjecia = link(i) do zdjęć z Dysku Google („Każda osoba mająca link”), kilka linków oddziel spacją
//  Noclegi:     nazwa | miejscowosc | opis | telefon | strona | adres | wspolrzedne | zrodlo
//  Zdrowie:     rodzaj | nazwa | miejscowosc | adres | telefon | godziny | wspolrzedne | opis | zrodlo
//               rodzaj = szpital / przychodnia / apteka / fizjoterapia; godziny np. „pn–pt 8:00–16:00, sob 8:00–13:00” albo „całodobowo”

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
  Noclegi: [],
  Zdrowie: [],
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
function parseCSV(t, karta){
  const rows=[]; let row=[], f="", q=false;
  for(let i=0;i<t.length;i++){ const c=t[i];
    if(q){ if(c==='"'){ if(t[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===','){ row.push(f); f=""; }
    else if(c==='\n'){ row.push(f); rows.push(row); row=[]; f=""; } else if(c!=='\r') f+=c; }
  if(f!==""||row.length){ row.push(f); rows.push(row); }
  if(!rows.length) return [];
  const domyslne=(typeof KOLUMNY!=="undefined"&&KOLUMNY[karta])||[];
  const head=rows[0].map((h,i)=>h.trim().toLowerCase()||domyslne[i]||"");
  return rows.slice(1).filter(r=>r.some(x=>x.trim()!=="")).map(r=>Object.fromEntries(head.map((h,i)=>[h,(r[i]||"").trim()])));
}

// Kolumna, która musi być w nagłówku karty. Google przy braku karty o danej nazwie podaje PIERWSZĄ kartę,
// więc bez tej kontroli apka pokazałaby cudze dane (np. śmieci jako ogłoszenia).
const WYMAGANE={Ogloszenia:"tytul",Wydarzenia:"nazwa",Smieci:"rodzaj",Miejsca:"nazwa",Kontakty:"telefon",Parafia:"pole",Historia:"rok",Noclegi:"miejscowosc",Zdrowie:"rodzaj"};
// Kolejność kolumn w każdej karcie — gdy Google zgubi nazwę kolumny (zdarza się), bierzemy ją stąd po pozycji.
const KOLUMNY={Ogloszenia:["data","tytul","tresc","wazne_do"],Wydarzenia:["data","godzina","nazwa","miejsce","opis"],
  Smieci:["data","rodzaj"],Miejsca:["nazwa","wies","opis","wspolrzedne"],Kontakty:["nazwa","telefon","opis"],
  Parafia:["pole","tresc"],Historia:["rok","tytul","tresc","zdjecia","podpis","autor","zrodlo"],
  Noclegi:["nazwa","miejscowosc","opis","telefon","strona","adres","wspolrzedne","zrodlo"],
  Zdrowie:["rodzaj","nazwa","miejscowosc","adres","telefon","godziny","wspolrzedne","opis","zrodlo"]};

// Zwraca {wiersze, przyklad:true/false, zapisane:true/false}. Bez internetu: ostatnia zapisana kopia.
async function wczytaj(karta){
  if(!ARKUSZ_ID) return {wiersze:PRZYKLADY[karta]||[], przyklad:true};
  const klucz="wirk-"+karta;
  try{
    const url=`https://docs.google.com/spreadsheets/d/${ARKUSZ_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(karta)}`;
    const res=await fetch(url,{cache:"no-store"}); if(!res.ok) throw new Error(res.status);
    const tekst=await res.text();
    const naglowki=(tekst.split("\n")[0]||"").toLowerCase();
    if(!naglowki.includes('"'+WYMAGANE[karta]+'"') && !naglowki.split(",").map(s=>s.trim()).includes(WYMAGANE[karta]))
      return {wiersze:PRZYKLADY[karta]||[], przyklad:true, brakKarty:true};   // karty jeszcze nie ma w arkuszu
    const wiersze=parseCSV(tekst, karta);
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

// Worki na śmieci: kolor rozpoznawany po słowie w kolumnie „rodzaj”
const KOLORY_SMIECI=[[/plast|metal/i,"#F2C230"],[/papier/i,"#2F6FD0"],[/szk/i,"#2E9E52"],[/bio/i,"#8B5A2B"],[/gabaryt|elektro/i,"#7A6FB3"],[/.*/,"#4A4A4A"]];
const kolorSmieci=r=>KOLORY_SMIECI.find(([re])=>re.test(r||""))[1];
// worek na śmieci: pękaty worek, zawiązany u góry, z dwoma „uszami” i kilkoma fałdami
const worek=r=>{ const c=kolorSmieci(r); return `<svg class="worek" viewBox="0 0 20 22" aria-hidden="true">
  <path d="M7.4 6.2 4.6 1.8c1.8-.2 3.6.7 5.4 2.5 1.8-1.8 3.6-2.7 5.4-2.5l-2.8 4.4z" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width=".7" stroke-linejoin="round"/>
  <path d="M7.6 6.4c-3.6 1.4-6 4.6-6 8.4 0 3.9 3.4 5.9 8.4 5.9s8.4-2 8.4-5.9c0-3.8-2.4-7-6-8.4z" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width=".7"/>
  <rect x="7.2" y="5.6" width="5.6" height="1.6" rx=".8" fill="rgba(0,0,0,.4)"/>
  <path d="M6 11.5c.6 2.4 1.9 4.6 3.7 6.2M14.2 11.8c-.4 1.8-1.2 3.4-2.4 4.7" stroke="rgba(255,255,255,.35)" stroke-width=".9" fill="none" stroke-linecap="round"/></svg>`; };
const dniDo=d=>Math.round((d-dzis())/864e5);

// ===== Moje notatki — zapisane tylko w tym telefonie (pamięć przeglądarki) =====
// notatka: {id, tekst, kiedy:"2026-11-10" albo "2026-11-10T18:00" albo "", naGlownej:bool, zrobione:bool, utworzono:ms}
const K_NOTATKI="wirk-notatki";
function notatki(){ try{ return JSON.parse(localStorage.getItem(K_NOTATKI)||"[]"); }catch(e){ return []; } }
function zapiszNotatki(l){ try{ localStorage.setItem(K_NOTATKI,JSON.stringify(l)); return true; }catch(e){ return false; } }
function kiedyNotatki(s){   // → {d: Date, godzina: bool} albo null
  if(!s) return null; const m=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s); if(!m) return null;
  return {d:new Date(+m[1],+m[2]-1,+m[3],m[4]?+m[4]:0,m[5]?+m[5]:0), godzina:!!m[4]};
}
function opisKiedy(s){
  const k=kiedyNotatki(s); if(!k) return "";
  const dzien=new Date(k.d); dzien.setHours(0,0,0,0);
  return kiedy(dzien)+(k.godzina?`, ${String(k.d.getHours()).padStart(2,"0")}:${String(k.d.getMinutes()).padStart(2,"0")}`:"");
}
// przypomnienie „na czasie”: minęła godzina (albo nadszedł dzień, gdy bez godziny) i notatka nie jest zrobiona
function naCzasie(n){ const k=kiedyNotatki(n.kiedy); if(!k||n.zrobione) return false;
  return k.godzina ? k.d<=new Date() : k.d<=dzis(); }
const notkaPrzyklad='<p style="margin:0 0 10px;padding:8px 12px;border-radius:10px;background:var(--accent-soft);color:var(--fg);font-size:14px"><strong style="color:var(--accent)">Przykładowe dane.</strong> Prawdziwe pojawią się po podłączeniu arkusza.</p>';
