// shared by the pages of the bottom bar: the board drawn at 1440 wide (720 on phones) and scaled to the window, and a short message.
// With ?embed=1 the page is shown in the panel over the map: links ask the map to go there, so the clouds close over the whole screen.
(() => {
  const embed = new URLSearchParams(location.search).has('embed');
  if (embed) {
    document.documentElement.classList.add('embed');
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]'); const h = a?.getAttribute('href');
      if (!h || h.startsWith('#') || e.ctrlKey || e.metaKey || e.button) return;
      e.preventDefault(); e.stopPropagation();
      parent.postMessage({ ajyal: 'go', href: new URL(h, location.href).href }, location.origin);
    }, true);
    // Escape closes the panel, unless one of the page's own small windows is open
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) parent.postMessage({ ajyal: 'close' }, location.origin); });
  }
  const page = document.getElementById('page'), wrap = document.getElementById('wrap');
  function fit() {
    const B = innerWidth < 760 ? 720 : 1440;
    page.style.width = B + 'px'; page.classList.toggle('narrow', B < 1440);
    const k = Math.min(innerWidth / B, 1.5), x = Math.max(0, (innerWidth - B * k) / 2);
    page.style.transform = 'translateX(' + x + 'px) scale(' + k + ')';
    wrap.style.height = page.offsetHeight * k + 'px';
  }
  addEventListener('resize', fit);
  function toast(s) {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = s; el.classList.add('show');
    clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), 2400);
  }
  window.Hub = { fit, toast, embed };
})();
