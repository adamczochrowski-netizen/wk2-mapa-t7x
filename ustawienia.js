// Moje Wirkowice — ustawienia widoku (zapamiętywane w telefonie):
//  • „Duży tekst” — powiększa teksty i przyciski (wygodniej dla seniorów),
//  • „Motyw” — jak w telefonie / jasny / ciemny.
// Wczytywany w <head>, więc ustawienia działają od razu, bez mignięcia.
(function(){
  const K_DUZE="wirk-duze", K_MOTYW="wirk-motyw";
  const get=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const set=(k,v)=>{ try{ v===null?localStorage.removeItem(k):localStorage.setItem(k,v); }catch(e){} };
  const root=document.documentElement;
  function zastosuj(){
    const m=get(K_MOTYW); if(m==="light"||m==="dark") root.setAttribute("data-theme",m); else root.removeAttribute("data-theme");
    if(get(K_DUZE)==="1") root.setAttribute("data-duze","1"); else root.removeAttribute("data-duze");
  }
  zastosuj();

  const CSS=`
  html[data-duze] .wrap, html[data-duze] .top, html[data-duze] .card{zoom:1.22}
  .ust-btn{position:fixed;z-index:60;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));
    width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--fg);
    font:700 17px/1 Georgia,serif;box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer}
  .ust-btn:focus-visible,.ust-pan button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .ust-pan{position:fixed;z-index:61;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(72px + env(safe-area-inset-bottom,0px));
    width:min(280px,calc(100vw - 28px));padding:14px;border-radius:14px;background:var(--panel);color:var(--fg);border:1px solid var(--line);
    box-shadow:0 10px 30px rgba(0,0,0,.22);font:15px/1.4 "Source Sans 3","Segoe UI",system-ui,sans-serif}
  .ust-pan h3{margin:0 0 10px;font:700 16px/1.2 Bitter,Georgia,serif}
  .ust-pan p{margin:12px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .ust-seg{display:flex;gap:6px}
  .ust-seg button{flex:1;padding:9px 6px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:600 14px/1.2 inherit;cursor:pointer}
  .ust-seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}`;
  function ui(){
    const st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
    const b=document.createElement("button"); b.className="ust-btn"; b.type="button"; b.textContent="Aa";
    b.setAttribute("aria-label","Ustawienia widoku: duży tekst i motyw"); b.setAttribute("aria-expanded","false");
    const p=document.createElement("div"); p.className="ust-pan"; p.hidden=true; p.setAttribute("role","dialog"); p.setAttribute("aria-label","Ustawienia widoku");
    p.innerHTML=`<h3>Wygląd</h3>
      <p>Wielkość tekstu</p><div class="ust-seg" data-k="duze"><button type="button" data-v="0">Zwykły</button><button type="button" data-v="1">Duży</button></div>
      <p>Motyw</p><div class="ust-seg" data-k="motyw"><button type="button" data-v="auto">Jak telefon</button><button type="button" data-v="light">Jasny</button><button type="button" data-v="dark">Ciemny</button></div>`;
    document.body.append(b,p);
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
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ui); else ui();
})();
