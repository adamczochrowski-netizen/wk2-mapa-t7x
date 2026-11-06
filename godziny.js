// Moje Wirkowice — godziny otwarcia („otwarte teraz”) i odległości. Używają: zdrowie.html, index.html (karta „Dziś”).
const WIRK={lat:50.8722, lon:23.0737};
const km=(a,b,c,d)=>{ const R=6371,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);
  const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
const kmTxt=d=>d<1?Math.round(d*1000)+" m":d.toFixed(1).replace(".",",")+" km";
// rodzaj z arkusza → grupa
const rodzajK=s=>{ s=(s||"").toLowerCase();
  return /weteryn|zwierz/.test(s)?"zwierzeta":/aptek/.test(s)?"apteka":/szpital|sor|pogotow|nocn/.test(s)?"szpital":/fizjo|rehab/.test(s)?"fizjoterapia":"przychodnia"; };
// wiersz karty „Zdrowie” → z odległością od Wirkowic
const miejsceZdrowia=r=>{
  const c=/(-?\d+[.,]\d+)\s*[,; ]\s*(-?\d+[.,]\d+)/.exec(r.wspolrzedne||"");
  const lat=c?+c[1].replace(",","."):null, lon=c?+c[2].replace(",","."):null;
  return {...r, k:rodzajK(r.rodzaj), lat, lon, odl:lat!=null?km(WIRK.lat,WIRK.lon,lat,lon):999};
};

// --- „Otwarte teraz” z godzin typu „pn–pt 8:00–16:00, sob 8:00–13:00”, „sob–nd całą dobę”, „całodobowo” ---
const DNI_TYG={nd:0,niedz:0,pn:1,pon:1,wt:2,śr:3,sr:3,czw:4,cz:4,pt:5,pią:5,sob:6,so:6};
function dniZ(t){                       // „pn–pt” → [1..5], „sob–nd” → [6,0], „codziennie” → wszystkie
  if(/codzien|każdy|kazdy/.test(t)) return [0,1,2,3,4,5,6];
  const m=/^([a-ząćęłńóśźż]+)\.?\s*(?:[-–]\s*([a-ząćęłńóśźż]+)\.?)?/.exec(t); if(!m||!(m[1] in DNI_TYG)) return null;
  const a=DNI_TYG[m[1]], b=m[2] in DNI_TYG?DNI_TYG[m[2]]:a, out=[]; for(let d=a;;d=(d+1)%7){ out.push(d); if(d===b) break; } return out;
}
const minuty=s=>{ const [h,m]=s.split(":").map(Number); return h*60+(m||0); };
function plan(godz){                    // → {dzien: [[od,do], …]} w minutach; „do” może być < „od” (przez północ)
  const g=(godz||"").toLowerCase().replace(/\s+/g," ").trim(); if(!g) return null;
  if(/^(całodob|calodob|24\s*h|całą dobę)/.test(g)) return {caly:true};
  const p={}; let jest=false;
  for(const czesc of g.split(/[,;]/)){
    const c=czesc.trim(), dni=dniZ(c); if(!dni) continue;
    let z=null;
    if(/całą dobę|całodob|0:00\s*[-–]\s*24:00/.test(c)) z=[0,1440];
    else { const m=/(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/.exec(c); if(m) z=[minuty(m[1]),minuty(m[2])]; }
    if(!z) continue; jest=true;
    dni.forEach(d=>(p[d]=p[d]||[]).push(z));
  }
  return jest?p:null;
}
function otwarte(godz, teraz=new Date()){
  const p=plan(godz); if(!p) return null; if(p.caly) return true;
  const d=teraz.getDay(), wcz=(d+6)%7, t=teraz.getHours()*60+teraz.getMinutes();
  for(const [a,b] of p[d]||[]){ if(b>a ? t>=a&&t<b : t>=a) return true; }
  for(const [a,b] of p[wcz]||[]){
    if(b<a && t<b) return true;                                         // wczoraj od 18:00 do dziś 8:00
    if(a===0&&b===1440) for(const [x,y] of p[d]||[]) if(y<x && t<y) return true;  // po całej dobie ciągle do rana
  }
  return false;
}
// do której dziś otwarte (np. „do 20:00”), albo „całą dobę”
function doKtorej(godz, teraz=new Date()){
  const p=plan(godz); if(!p) return ""; if(p.caly) return "całą dobę";
  const t=teraz.getHours()*60+teraz.getMinutes(), f=m=>Math.floor(m/60)+":"+String(m%60).padStart(2,"0");
  for(const [a,b] of p[teraz.getDay()]||[]){ if(a===0&&b===1440) return "całą dobę"; if(b>a&&t>=a&&t<b) return "do "+f(b); if(b<a&&t>=a) return "do "+f(b)+" rano"; }
  for(const [a,b] of p[(teraz.getDay()+6)%7]||[]) if(b<a&&t<b) return "do "+f(b);
  return "";
}
const naDzis=godz=>{ const p=plan(godz); if(!p||p.caly) return "";
  const z=p[new Date().getDay()]; if(!z) return "dziś nieczynne";
  const f=m=>Math.floor(m/60)+":"+String(m%60).padStart(2,"0");
  return "dziś "+z.map(([a,b])=>a===0&&b===1440?"całą dobę":f(a)+"–"+(b===1440?"24:00":f(b))).join(", "); };
