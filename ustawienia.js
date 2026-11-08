// Moje Wirkowice — ustawienia widoku (zapamiętywane w telefonie):
//  • „Duży tekst” — powiększa teksty i przyciski (wygodniej dla seniorów),
//  • „Motyw” — jak w telefonie / jasny / ciemny.
// Wczytywany w <head>, więc ustawienia działają od razu, bez mignięcia.
(function(){
  const K_DUZE="wirk-duze", K_MOTYW="wirk-motyw";
  const get=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const set=(k,v)=>{ try{ v===null?localStorage.removeItem(k):localStorage.setItem(k,v); }catch(e){} };
  const root=document.documentElement;
  const TYLKO_CIEMNY=true;   // na razie apka ma tylko ciemny motyw; false = wraca wybór motywu w panelu „Aa”
  function zastosuj(){
    const m=TYLKO_CIEMNY?"dark":get(K_MOTYW); if(m==="light"||m==="dark") root.setAttribute("data-theme",m); else root.removeAttribute("data-theme");
    if(get(K_DUZE)==="1") root.setAttribute("data-duze","1"); else root.removeAttribute("data-duze");
  }
  zastosuj();

  const CSS=`
  html[data-duze] .wrap, html[data-duze] .top, html[data-duze] .card{zoom:1.22}
  /* Dolny pasek: Wstecz, Dalej, Aa — w aplikacji na ekranie głównym telefon nie ma własnych strzałek */
  body.z-paskiem{padding-bottom:calc(54px + env(safe-area-inset-bottom,0px))}
  .ust-btn.plywa{position:fixed;z-index:60;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));
    width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--fg);
    font:700 16px/1 Georgia,serif;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}
  .pasek{position:fixed;z-index:60;left:0;right:0;bottom:0;padding:6px calc(10px + env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) calc(10px + env(safe-area-inset-left,0px));
    background:color-mix(in srgb,var(--bg) 88%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid var(--line)}
  .pasek-in{max-width:720px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 48px;gap:6px}
  .pasek button{height:38px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);
    font:600 15px/1 "Source Sans 3","Segoe UI",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
  .pasek button svg{width:17px;height:17px}
  .pasek button:disabled{opacity:.4;cursor:default}
  .pasek .ust-btn{font:700 16px/1 Georgia,serif}
  .pasek button:focus-visible,.ust-pan button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .ust-pan{position:fixed;z-index:61;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(62px + env(safe-area-inset-bottom,0px));
    width:min(280px,calc(100vw - 24px));padding:14px;border-radius:14px;background:var(--panel);color:var(--fg);border:1px solid var(--line);
    box-shadow:0 10px 30px rgba(0,0,0,.22);font:15px/1.4 "Source Sans 3","Segoe UI",system-ui,sans-serif}
  .odsw{position:fixed;z-index:70;left:50%;top:calc(6px + env(safe-area-inset-top,0px));width:38px;height:38px;margin-left:-19px;border-radius:50%;
    display:grid;place-items:center;background:var(--panel);color:var(--muted);border:1px solid var(--line);box-shadow:0 4px 14px rgba(0,0,0,.3);
    font:700 20px/1 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .15s}
  .odsw.gotowe{color:var(--accent);border-color:var(--accent)}
  .odsw.kreci{animation:odswKrec .8s linear infinite}
  @keyframes odswKrec{to{transform:translateY(50px) rotate(360deg)}}
  .ust-pan h3{margin:0 0 10px;font:700 16px/1.2 Bitter,Georgia,serif}
  .ust-pan p{margin:12px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .ust-seg{display:flex;gap:6px}
  .ust-seg button{flex:1;padding:9px 6px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:600 14px/1.2 inherit;cursor:pointer}
  .ust-seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}`;
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
    const b=document.createElement("button"); b.className="ust-btn"; b.type="button"; b.textContent="Aa";
    b.setAttribute("aria-label","Ustawienia widoku: duży tekst i motyw"); b.setAttribute("aria-expanded","false");
    const p=document.createElement("div"); p.className="ust-pan"; p.hidden=true; p.setAttribute("role","dialog"); p.setAttribute("aria-label","Ustawienia widoku");
    p.innerHTML=`<h3>Wygląd</h3>
      <p>Wielkość tekstu</p><div class="ust-seg" data-k="duze"><button type="button" data-v="0">Zwykły</button><button type="button" data-v="1">Duży</button></div>`+(TYLKO_CIEMNY?"":`
      <p>Motyw</p><div class="ust-seg" data-k="motyw"><button type="button" data-v="auto">Jak telefon</button><button type="button" data-v="light">Jasny</button><button type="button" data-v="dark">Ciemny</button></div>`);
    // Na stronie głównej bez paska — tylko pływające „Aa”; na podstronach pasek Wstecz / Dalej / Aa
    if(glowna){ b.classList.add("plywa"); document.body.append(b,p); }
    else { bar.querySelector(".pasek-in").append(b); document.body.classList.add("z-paskiem"); document.body.append(bar,p); }
    const odswiez=()=>{
      const d=get(K_DUZE)==="1"?"1":"0", m=get(K_MOTYW)||"auto";
      p.querySelectorAll('[data-k="duze"] button').forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===d)));
      p.querySelectorAll('[data-k="motyw"] button').forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===m)));
    };
    p.addEventListener("click",e=>{
      const x=e.target.closest("button[data-v]"); if(!x) return;
      const k=x.parentElement.dataset.k;
      if(k==="duze") set(K_DUZE,x.dataset.v==="1"?"1":null);
      if(k==="motyw") set(K_MOTYW,x.dataset.v==="auto"?null:x.dataset.v);
      zastosuj(); odswiez();
      window.dispatchEvent(new Event("resize"));   // mapa cmentarza przelicza wymiary
    });
    const otworz=v=>{ p.hidden=!v; b.setAttribute("aria-expanded",String(v)); if(v) odswiez(); };
    b.onclick=()=>otworz(p.hidden);
    document.addEventListener("click",e=>{ if(!p.hidden&&!p.contains(e.target)&&e.target!==b) otworz(false); });
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
    addEventListener("touchend",()=>{ if(y0!==null&&dy>95){ k.classList.add("kreci"); setTimeout(()=>location.reload(),150); } else { k.style.opacity=0; k.style.transform=""; } y0=null; dy=0; });
  }
  const start=()=>{ ui(); odswiezanie(); };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
