/* ============================================================
   ALKYMIA — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Flavor data ---------- */
  const FLAVORS = [
    { id:'margarita', name:'Margarita', accent:'166,205,70',  base:'tequila', cats:['tequila'],
      tag:'El equilibrio perfecto.', price:'18.000',
      desc:'Tequila, limón y triple sec en una receta tradicional que conquista desde el primer sorbo.' },
    { id:'jalisco', name:'Jalisco', accent:'230,160,40', base:'tequila', cats:['tequila','tropical'],
      tag:'Exótico y atrevido.', price:'18.000',
      desc:'Maracuyá, mango y un sutil toque picante se unen para ofrecer un sabor diferente e inolvidable.' },
    { id:'clasea', name:'Clase A', accent:'70,150,230', base:'tequila', cats:['tequila','tropical'],
      tag:'Tropical y sorprendente.', price:'19.000',
      desc:'Una mezcla suave de frutas exóticas con un perfil dulce y refrescante que invita a seguir disfrutando.' },
    { id:'mojito', name:'Mojito', accent:'150,200,60', base:'ron', cats:['ron'],
      tag:'Refrescante, ligero y auténtico.', price:'18.000',
      desc:'Hierbabuena, limón y ron se fusionan en una mezcla equilibrada que nunca pasa de moda.' },
    { id:'moscowmule', name:'Moscow Mule', accent:'200,180,150', base:'vodka', cats:['vodka'],
      tag:'Intenso y refrescante.', price:'19.000',
      desc:'Una explosión de jengibre y lima con un toque de vodka que crea una experiencia llena de personalidad.' },
    { id:'tamarindo', name:'Tamarindo', accent:'200,80,50', base:'ron', cats:['tropical'],
      tag:'Audaz y diferente.', price:'18.000',
      desc:'El carácter único del tamarindo se mezcla con notas dulces y ácidas para una experiencia inolvidable.' },
    { id:'summer', name:'Summer', accent:'225,200,70', base:'ron', cats:['tropical'],
      tag:'Dulce, vibrante y tropical.', price:'19.000',
      desc:'La combinación perfecta de frutas que despierta tus sentidos y te transporta a un ambiente lleno de energía y diversión.' },
  ];

  const WA = 'https://wa.me/573009651392?text=';
  const arrow = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function renderCards() {
    const grid = document.getElementById('cartaGrid');
    if (!grid) return;
    grid.innerHTML = FLAVORS.map(f => `
      <article class="card reveal" data-cats="${f.cats.join(' ')}" style="--accent-rgb:${f.accent}">
        <div class="card-glow"></div>
        <div class="card-media">
          <span class="card-ml">400 ML</span>
          <img src="assets/cans/${f.id}.jpg" alt="Alkymia ${f.name}" decoding="async">
        </div>
        <div class="card-body">
          <h3 class="card-name">${f.name}</h3>
          <div class="card-tag">${f.tag}</div>
          <p class="card-desc">${f.desc}</p>
          <div class="card-foot">
            <div class="card-price"><small>$</small>${f.price}</div>
            <a class="card-order" href="${WA}Hola%20Alkymia%2C%20quiero%20pedir%20${encodeURIComponent(f.name)}" target="_blank" rel="noopener">Pedir ${arrow}</a>
          </div>
        </div>
      </article>`).join('');
    // re-observe new reveals
    grid.querySelectorAll('.reveal').forEach((el,i)=>{ el.dataset.d = String((i%4)); observeReveal(el); });
  }

  /* ---------- Filters ---------- */
  function initFilters() {
    const filters = document.getElementById('filters');
    if (!filters) return;
    filters.addEventListener('click', e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.querySelectorAll('#cartaGrid .card').forEach(card => {
        const show = f === 'all' || card.dataset.cats.split(' ').includes(f);
        card.style.display = show ? '' : 'none';
      });
    });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });

    const drawer = document.getElementById('drawer');
    const open = () => drawer.classList.add('open');
    const close = () => drawer.classList.remove('open');
    document.getElementById('menuBtn').addEventListener('click', open);
    document.getElementById('drawerX').addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observeReveal(el) { if (io) io.observe(el); else el.classList.add('in'); }
  function initReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    // safety: reveal anything already on screen immediately (no observer race)
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight * 0.96) { el.classList.add('in'); io.unobserve(el); }
      });
    });
  }

  /* ---------- Custom golden cursor + trail ---------- */
  function initCursor() {
    const ring = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    let rx=innerWidth/2, ry=innerHeight/2, dx=rx, dy=ry, raf=0, lastTrail=0;
    const fine = matchMedia('(pointer:fine)').matches;
    if (!fine) return;

    function move(e){
      dx=e.clientX; dy=e.clientY;
      dot.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      // trail
      const now=performance.now();
      if (document.body.classList.contains('cursor-on') && getMotion()>0 && now-lastTrail>26){
        lastTrail=now; spawnTrail(dx,dy);
      }
      if(!raf) raf=requestAnimationFrame(loop);
    }
    function loop(){
      rx+=(dx-rx)*0.18; ry+=(dy-ry)*0.18;
      ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      if(Math.abs(dx-rx)>0.5||Math.abs(dy-ry)>0.5){ raf=requestAnimationFrame(loop); } else { raf=0; }
    }
    function spawnTrail(x,y){
      const t=document.createElement('div'); t.className='trail';
      t.style.left=x+'px'; t.style.top=y+'px';
      document.body.appendChild(t);
      const s=0.5+Math.random()*0.9;
      t.animate([{opacity:.7,transform:`translate(-50%,-50%) scale(${s})`},
                 {opacity:0,transform:`translate(-50%,-50%) scale(0)`}],
                {duration:620,easing:'ease-out'}).onfinish=()=>t.remove();
    }
    // grow ring over interactive
    document.addEventListener('mouseover', e=>{
      if(e.target.closest('a,button,.card,.tile,.chip')){ ring.style.width='52px'; ring.style.height='52px'; ring.style.background='rgba(var(--accent-rgb),.10)'; }
      else { ring.style.width='34px'; ring.style.height='34px'; ring.style.background='transparent'; }
    });
    window.addEventListener('mousemove', move, { passive:true });
  }

  /* ---------- Tweaks bridge ---------- */
  function getMotion(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion'))||0; }

  const ACCENTS = {
    ambar:  { a:'#C9933A', a2:'#E84C1E', soft:'#E2B566', rgb:'201,147,58' },
    brasa:  { a:'#E84C1E', a2:'#C9933A', soft:'#F4794F', rgb:'232,76,30' },
  };

  window.applyTweaks = function (t) {
    const root = document.documentElement;
    // accent
    const ac = ACCENTS[t.accent] || ACCENTS.ambar;
    root.style.setProperty('--accent', ac.a);
    root.style.setProperty('--accent-2', ac.a2);
    root.style.setProperty('--accent-soft', ac.soft);
    root.style.setProperty('--accent-rgb', ac.rgb);
    // headline font
    if (t.headline === 'alt') {
      root.style.setProperty('--headline', 'var(--display-alt)');
      root.style.setProperty('--headline-ital', 'normal');
    } else {
      root.style.setProperty('--headline', 'var(--display)');
      root.style.setProperty('--headline-ital', 'italic');
    }
    // motion
    const m = Math.max(0, Math.min(1, (t.motion ?? 70) / 100));
    root.style.setProperty('--motion', String(m));
    root.setAttribute('data-motion', m <= 0.001 ? 'off' : (m < 0.4 ? 'low' : 'high'));
    // cursor
    document.body.classList.toggle('cursor-on', !!t.cursor && matchMedia('(pointer:fine)').matches);
  };

  /* ---------- init ---------- */
  function init(){
    renderCards();
    initFilters();
    initNav();
    initReveals();
    initCursor();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
