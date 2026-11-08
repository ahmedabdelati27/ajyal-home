// shared by the pages of the bottom bar: the board drawn at 1440 wide (720 on phones) and scaled to the window, and a short message
(() => {
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
  window.Hub = { fit, toast };
})();
