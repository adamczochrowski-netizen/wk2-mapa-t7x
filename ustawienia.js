// Moje Wirkowice — „Opcje” (zapamiętywane w telefonie):
//  • wielkość tekstu: zwykły / duży / bardzo duży,
//  • wysoki kontrast: jaśniejsze napisy i wyraźniejsze ramki,
//  • kolory dla daltonistów: zamiast zielone/czerwone — niebieskie/pomarańczowe, plus znaki ✓ i ✕,
//  • bez animacji: nic się nie rusza (mniej zawrotów głowy, oszczędza baterię),
//  • pobierz najświeższe dane, instrukcja dodania apki do ekranu.
// Wczytywany w <head>, więc ustawienia działają od razu, bez mignięcia.
(function(){
  const K_DUZE="wirk-duze", K_MOTYW="wirk-motyw", K_KONTR="wirk-kontrast", K_DALT="wirk-dalton", K_SPOK="wirk-spokoj", K_PROSTY="wirk-prosty";
  // Zapis w dwóch miejscach: pamięć strony (localStorage) i ciasteczko. Na iPhonie apka z ekranu głównego
  // (zwłaszcza dodana z Firefoksa) potrafi gubić localStorage między stronami — wtedy ustawienia czytamy z ciasteczka.
  const SCIEZKA=location.pathname.replace(/[^/]*$/,"");
  const zCiastka=k=>{ const m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)")); return m?decodeURIComponent(m[1]):null; };
  const get=k=>{ let v=null; try{ v=localStorage.getItem(k); }catch(e){} return v!==null?v:zCiastka(k); };
  const set=(k,v)=>{ try{ v===null?localStorage.removeItem(k):localStorage.setItem(k,v); }catch(e){}
    document.cookie=k+"="+(v===null?"":encodeURIComponent(v))+";path="+SCIEZKA+";max-age="+(v===null?0:31536000)+";SameSite=Lax"; };
  // ustawienia zapisane wcześniej tylko w pamięci strony — przepisz też do ciasteczka
  ["wirk-duze","wirk-motyw","wirk-kontrast","wirk-dalton","wirk-spokoj","wirk-prosty"].forEach(k=>{ try{ const v=localStorage.getItem(k); if(v!==null&&zCiastka(k)!==v) set(k,v); }catch(e){} });
  const root=document.documentElement;
  // Motyw: domyślnie ciemny; w Opcjach można włączyć jasny (lepiej czytelny w słońcu, wygodny dla części starszych osób)
  function zastosuj(){
    const m=get(K_MOTYW)==="light"?"light":"dark"; root.setAttribute("data-theme",m);
    const tc=document.querySelector('meta[name="theme-color"]'); if(tc) tc.setAttribute("content",m==="light"?"#EDF0EB":"#131915");
    const d=get(K_DUZE); if(d==="1"||d==="2") root.setAttribute("data-duze",d); else root.removeAttribute("data-duze");
    [[K_KONTR,"data-kontrast"],[K_DALT,"data-dalton"],[K_SPOK,"data-spokoj"],[K_PROSTY,"data-prosty"]].forEach(([k,a])=>{ if(get(k)==="1") root.setAttribute(a,""); else root.removeAttribute(a); });
  }
  zastosuj();
  // Style trybów — od razu w <head>, żeby nie było mignięcia zwykłego wyglądu
  const TRYBY=document.createElement("style"); TRYBY.textContent=`
  html[data-duze="1"] .wrap, html[data-duze="1"] .top, html[data-duze="1"] .card{zoom:1.22}
  html[data-duze="2"] .wrap, html[data-duze="2"] .top, html[data-duze="2"] .card{zoom:1.42}
  :root:root[data-kontrast]:not([data-theme="light"]){--muted:#E2E8E4;--line:#8A988F;--fg:#FFFFFF}
  :root:root[data-kontrast][data-theme="light"]{--muted:#2B342E;--line:#6F7C74;--fg:#000000;--panel:#FFFFFF}
  html[data-kontrast] .tile, html[data-kontrast] .card, html[data-kontrast] .kal{border-width:2px}
  html[data-kontrast] a{text-decoration-thickness:2px}
  :root:root[data-dalton]:not([data-theme="light"]){--green:#7FB2FF;--green-soft:#1A2B44}
  :root:root[data-dalton][data-theme="light"]{--green:#1F5FBF;--green-soft:#DCE8FA}
  html[data-dalton] .stan.tak::before{content:"✓ "}
  html[data-dalton] .stan.nie{background:#3D2A12;color:#F5B25B}
  html[data-dalton][data-theme="light"] .stan.nie{background:#FBE8CF;color:#8A4A00}
  html[data-dalton] .stan.nie::before{content:"✕ "}
  .worek .wl{display:none}
  html[data-dalton] .worek .wl{display:inline;font:700 9px/1 system-ui,sans-serif;fill:#fff;stroke:rgba(0,0,0,.75);stroke-width:1.6px;paint-order:stroke}
  html[data-dalton] .worek .faldy{display:none}
  html[data-spokoj] *, html[data-spokoj] *::before, html[data-spokoj] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  html[data-spokoj]::view-transition-group(*), html[data-spokoj]::view-transition-old(*), html[data-spokoj]::view-transition-new(*){animation:none!important}`;
  document.head.appendChild(TRYBY);

  const CSS=`
  /* Dolny pasek: Wstecz, Dalej, Aa — w aplikacji na ekranie głównym telefon nie ma własnych strzałek */
  body.z-paskiem{padding-bottom:calc(54px + env(safe-area-inset-bottom,0px))}
  .pasek{position:fixed;z-index:60;left:0;right:0;bottom:0;padding:6px calc(10px + env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) calc(10px + env(safe-area-inset-left,0px));
    background:color-mix(in srgb,var(--bg) 88%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid var(--line)}
  .pasek-in{max-width:720px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr auto;gap:6px}
  .pasek-in.bez-opcji{grid-template-columns:1fr 1fr}
  .pasek button{height:38px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);
    font:600 15px/1 "Source Sans 3","Segoe UI",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
  .pasek button svg{width:17px;height:17px;display:inline-block;background:none;cursor:inherit;touch-action:auto;flex:none}
  .pasek button:disabled{opacity:.4;cursor:default}
  .pasek .ust-btn{padding:0 14px}
  .opcje-dol{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:22px 0 4px;padding:12px;border-radius:12px;border:1px dashed var(--line);background:transparent;color:var(--muted);font:600 15px/1.2 "Source Sans 3","Segoe UI",system-ui,sans-serif;cursor:pointer}
  .opcje-dol svg,.pasek .ust-btn svg{width:18px;height:18px}
  .pasek button:focus-visible,.ust-pan button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  /* Panel „Opcje” wysuwany od dołu */
  .ust-tlo{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.5)}
  .ust-tlo[hidden],.ust-pan[hidden]{display:none}
  .ust-pan{position:fixed;z-index:81;left:50%;bottom:0;transform:translateX(-50%);width:min(560px,100vw);max-height:86vh;overflow:auto;box-sizing:border-box;
    padding:16px calc(16px + env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) calc(16px + env(safe-area-inset-left,0px));
    border-radius:18px 18px 0 0;background:var(--panel);color:var(--fg);border:1px solid var(--line);border-bottom:0;
    box-shadow:0 -10px 30px rgba(0,0,0,.35);font:15px/1.4 "Source Sans 3","Segoe UI",system-ui,sans-serif;animation:ustWjazd .22s ease-out}
  @keyframes ustWjazd{from{transform:translate(-50%,40px);opacity:0}}
  .ust-gl{display:flex;justify-content:space-between;align-items:center}
  .ust-gl .x{width:40px;height:40px;border-radius:50%;border:0;background:transparent;color:var(--muted);font-size:24px;cursor:pointer}
  .ust-pan .opis{margin:5px 0 0;font-size:13px;color:var(--muted)}
  .ust-akcja{width:100%;padding:11px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:600 15px/1.2 "Source Sans 3","Segoe UI",system-ui,sans-serif;cursor:pointer}
  .odsw{position:fixed;z-index:70;left:50%;top:calc(6px + env(safe-area-inset-top,0px));width:38px;height:38px;margin-left:-19px;border-radius:50%;
    display:grid;place-items:center;background:var(--panel);color:var(--muted);border:1px solid var(--line);box-shadow:0 4px 14px rgba(0,0,0,.3);
    font:700 20px/1 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .15s}
  .odsw.gotowe{color:var(--accent);border-color:var(--accent)}
  .odsw.kreci{animation:odswKrec .8s linear infinite}
  @keyframes odswKrec{to{transform:translateY(50px) rotate(360deg)}}
  .ust-pan h3{margin:0;font:700 19px/1.2 Bitter,Georgia,serif}
  .ust-pan p{margin:16px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .ust-seg{display:flex;gap:6px}
  .ust-inst{font-size:14px;line-height:1.45;color:var(--fg)}
  .ust-seg button{flex:1;padding:9px 6px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:600 14px/1.2 "Source Sans 3","Segoe UI",system-ui,sans-serif;cursor:pointer}
  .ust-seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}`;
  const zIkony=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;   // apka uruchomiona z ikony
  function ui(){
    const st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
    const strz=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const bar=document.createElement("nav"); bar.className="pasek"; bar.setAttribute("aria-label","Nawigacja");
    bar.innerHTML=`<div class="pasek-in"><button type="button" class="wstecz">${strz("M15 5l-7 7 7 7")}Wstecz</button><button type="button" class="dalej">Dalej${strz("M9 5l7 7-7 7")}</button></div>`;
    const glowna=/(^|\/)(index\.html)?$/.test(location.pathname);
    const wst=bar.querySelector(".wstecz");
    // Wstecz: poprzednia strona; gdy apka otwarta od razu na podstronie — strona główna; na głównej bez historii nieaktywne
    if(glowna&&history.length<=1) wst.disabled=true;
    wst.onclick=()=>{ if(history.length>1) history.back(); else if(!glowna) location.href="index.html"; };
    bar.querySelector(".dalej").onclick=()=>history.forward();
    const ikOpcje='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';
    const b=document.createElement("button"); b.className=glowna?"opcje-dol":"ust-btn"; b.type="button";
    b.innerHTML=ikOpcje+(glowna?"Opcje: wielkość tekstu, kontrast, kolory":"Opcje");
    b.setAttribute("aria-label","Opcje: wielkość tekstu, kontrast, kolory, animacje"); b.setAttribute("aria-expanded","false");
    const tlo=document.createElement("div"); tlo.className="ust-tlo"; tlo.hidden=true;
    const p=document.createElement("div"); p.className="ust-pan"; p.hidden=true; p.setAttribute("role","dialog"); p.setAttribute("aria-modal","true"); p.setAttribute("aria-label","Opcje");
    const seg=(k,opcje)=>`<div class="ust-seg" data-k="${k}">${opcje.map(([v,t])=>`<button type="button" data-v="${v}">${t}</button>`).join("")}</div>`;
    const iOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    p.innerHTML=`<div class="ust-gl"><h3>Opcje</h3><button type="button" class="x" aria-label="Zamknij">×</button></div>
      <p>Tryb prosty</p>${seg("prosty",[["0","Wyłączony"],["1","Włączony"]])}<div class="opis">Strona główna z kilkoma dużymi przyciskami: 112, śmieci, msza, apteka, cmentarz. Wygodne dla babci i dziadka.</div>
      <p>Wielkość tekstu</p>${seg("duze",[["0","Zwykły"],["1","Duży"],["2","Bardzo duży"]])}
      <p>Motyw</p>${seg("motyw",[["0","Ciemny"],["light","Jasny"]])}<div class="opis">Jasny lepiej widać w słońcu, na dworze.</div>
      <p>Kontrast</p>${seg("kontrast",[["0","Zwykły"],["1","Wysoki"]])}<div class="opis">Jaśniejsze napisy i wyraźniejsze ramki.</div>
      <p>Kolory</p>${seg("dalton",[["0","Zwykłe"],["1","Dla daltonistów"]])}<div class="opis">„Otwarte / zamknięte” (Zdrowie, Urzędowe) w kolorze niebieskim i pomarańczowym ze znakami ✓ i ✕, a na workach na śmieci litery: S szkło, B bio, P papier, M plastik i metale, Z zmieszane.</div>
      <p>Animacje</p>${seg("spokoj",[["0","Włączone"],["1","Wyłączone"]])}<div class="opis">Nic się nie rusza na ekranie: mniej zawrotów głowy, mniej zużycia baterii.</div>
      <p>Dane</p><button type="button" class="ust-akcja" data-a="swieze">↻ Pobierz najświeższe dane</button>`+(zIkony?"":`
      <p>Apka na ekranie telefonu</p><div class="ust-inst">${iOS
        ?"W Safari dotknij <b>Udostępnij</b> (kwadrat ze strzałką; w nowszym Safari najpierw <b>⋯</b> w prawym dolnym rogu), przewiń w dół i wybierz <b>Do ekranu głównego</b>, zostaw włączone <b>Otwórz jako aplikację www</b> i dotknij <b>Dodaj</b>. Z Firefoksa czy Chrome też się da, ale najlepiej działa z Safari."
        :"Dotknij <b>⋮</b> w prawym górnym rogu przeglądarki i wybierz <b>Dodaj do ekranu głównego</b> albo <b>Zainstaluj aplikację</b>."}</div>`);
    // Na stronie głównej — przycisk „Opcje” na samym dole strony; na podstronach — w dolnym pasku
    if(glowna){ (document.querySelector("main")||document.body).appendChild(b); document.body.append(tlo,p); }
    // Opcje zmienia się tylko na stronie głównej; na podstronach pasek ma samo Wstecz / Dalej (ustawienia i tak działają wszędzie)
    else { bar.querySelector(".pasek-in").classList.add("bez-opcji"); document.body.classList.add("z-paskiem"); document.body.append(bar); }
    const KLUCZE={prosty:K_PROSTY,duze:K_DUZE,motyw:K_MOTYW,kontrast:K_KONTR,dalton:K_DALT,spokoj:K_SPOK};
    const odswiez=()=>{
      Object.entries(KLUCZE).forEach(([k,kl])=>{ const v=get(kl)||"0";
        p.querySelectorAll(`[data-k="${k}"] button`).forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===v))); });
    };
    p.addEventListener("click",e=>{
      if(e.target.closest(".x")){ otworz(false); return; }
      if(e.target.closest('[data-a="swieze"]')){ try{ sessionStorage.setItem("wirk-swieze","1"); }catch(_){} location.reload(); return; }
      const x=e.target.closest("button[data-v]"); if(!x) return;
      const k=x.parentElement.dataset.k; set(KLUCZE[k],x.dataset.v==="0"?null:x.dataset.v);
      zastosuj(); odswiez();
      if(k==="prosty") window.dispatchEvent(new Event("tryb-prosty"));
      window.dispatchEvent(new Event("resize"));   // mapa cmentarza przelicza wymiary
    });
    const otworz=v=>{ p.hidden=!v; tlo.hidden=!v; b.setAttribute("aria-expanded",String(v)); if(v){ odswiez(); p.querySelector(".x").focus(); } };
    b.onclick=()=>otworz(p.hidden);
    tlo.onclick=()=>otworz(false);
    document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!p.hidden){ otworz(false); b.focus(); } });
  }
  // Apka z ikony nie ma odświeżania pociągnięciem w dół (Safari i Chrome mają je tylko w przeglądarce) — dodajemy własne
  function odswiezanie(){
    const zIkony=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    if(!zIkony) return;
    const k=document.createElement("div"); k.className="odsw"; k.setAttribute("aria-hidden","true"); k.textContent="↻"; document.body.appendChild(k);
    let y0=null, dy=0;
    addEventListener("touchstart",e=>{ y0=null;
      if(scrollY>0||e.touches.length>1||e.target.closest("svg#svg,.map,.lb,input,textarea,select,[contenteditable]")) return;
      y0=e.touches[0].clientY; dy=0; },{passive:true});
    addEventListener("touchmove",e=>{ if(y0===null) return; dy=e.touches[0].clientY-y0;
      if(dy<=0||scrollY>0){ k.style.opacity=0; return; }
      const p=Math.min(dy,130); k.style.opacity=Math.min(1,p/70); k.style.transform=`translateY(${p*.45}px) rotate(${p*2.4}deg)`; k.classList.toggle("gotowe",dy>95); },{passive:true});
    addEventListener("touchend",()=>{ if(y0!==null&&dy>95){ k.classList.add("kreci"); try{ sessionStorage.setItem("wirk-swieze","1"); }catch(e){} setTimeout(()=>location.reload(),150); } else { k.style.opacity=0; k.style.transform=""; } y0=null; dy=0; });
  }
  const start=()=>{ ui(); odswiezanie(); };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
