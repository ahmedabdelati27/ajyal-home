// the wooden shelves of the forest and the beach: one shelf per admin category, the child's age group first
// shelf: { id, title, count, items, look: '' (wood) | 'sand' }
// item: { title, href, img, kinds: [{ src, c, name }], meta, clock, tag: 'new' | 'done', done (the word for done), p: '40%', label }
const Shelf = (() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const svg = (d, w = 2.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const CLOCK = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
  const item = (it) => `<a class="item" href="${it.href || '#'}" aria-label="${it.label}">
      <span class="cover"><img src="${it.img}" alt="">
        ${it.tag ? `<span class="tag ${it.tag}">${it.tag === 'done' ? `✓ ${it.done || 'مكتمل'}` : 'جديد'}</span>` : ''}
        <span class="kinds">${it.kinds.map((k) => `<span class="kind" style="--k:${k.c}" title="${k.name}"><img src="${k.src}" alt=""></span>`).join('')}</span>
        ${it.p ? `<span class="prog"><i style="width:${it.p}"></i></span>` : ''}
        ${it.meta ? `<span class="meta">${it.clock ? CLOCK : ''}${it.meta}</span>` : ''}</span>
      <span class="ledge"></span><span class="name">${it.title}</span></a>`;
  const all = (sh) => `<a class="item all" href="${sh.all || '#'}" aria-label="عرض كل ${sh.title}، ${ar(sh.count)}">
      <span class="pile">${sh.items.slice(0, 3).map((it, n) => `<img src="${it.img}" alt="" style="--r:${[-9, 8, 0][n]}deg">`).join('')}<span class="n">${ar(sh.count)}</span></span>
      <span class="ledge"></span><span class="name">عرض الكل</span></a>`;
  const shelf = (sh) => `<section class="shelf ${sh.look || ''}" data-id="${sh.id}" aria-label="${sh.title}">
      <div class="shelf-top"><h2 class="sign">${sh.title}</h2>
        <div class="moves"><button type="button" data-go="1" aria-label="السابق">${svg('<path d="M9 6l6 6-6 6"/>')}</button><button type="button" data-go="-1" aria-label="التالي">${svg('<path d="M15 6l-6 6 6 6"/>')}</button></div></div>
      <div class="track">${sh.items.map(item).join('')}${all(sh)}</div></section>`;

  // the arrows go off at the ends, and the far end fades while there is more to see
  // (right to left: scrollLeft is 0 at the start and negative toward the end)
  const sync = (host) => host.querySelectorAll('.shelf').forEach((sh) => {
    const t = sh.querySelector('.track'), x = Math.abs(t.scrollLeft), end = t.scrollWidth - t.clientWidth - 4;
    sh.querySelector('[data-go="1"]').disabled = x < 4;
    sh.querySelector('[data-go="-1"]').disabled = x >= end;
    sh.classList.toggle('more', x < end);
    sh.classList.toggle('fits', end <= 0);
  });

  function render(host, shelves) {
    host.innerHTML = shelves.map(shelf).join('');
    host.querySelectorAll('.track').forEach((t) => t.addEventListener('scroll', () => sync(host), { passive: true }));
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.moves button');
      if (b) { const t = b.closest('.shelf').querySelector('.track'); t.scrollBy({ left: b.dataset.go * t.clientWidth * 0.8 }); return; }
      // in the prototype some places are not built yet
      if (e.target.closest('a[href="#"]')) e.preventDefault();
    });
    addEventListener('resize', () => sync(host));
    sync(host);
  }
  return { render, sync };
})();
