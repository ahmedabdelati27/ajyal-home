// the path on the phone's garden and dunes: the places go down the page taking turns on the right and the left,
// and a path of stones joins them, drawn once they are laid out (Trail.road(box, '.pit') again whenever they move)
const Trail = (() => {
  function road(box, sel) {
    box.querySelector(':scope > .road')?.remove();
    if (box.hidden) return;
    const b = box.getBoundingClientRect();
    const pts = [...box.querySelectorAll(sel)].map((p) => { const r = p.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; });
    if (!pts.length) return;
    // in from the top edge, through every place, and out at the bottom
    let d = `M${pts[0][0]} -20 L${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], my = (y0 + y1) / 2; d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`; }
    d += ` L${pts[pts.length - 1][0]} ${b.height + 20}`;
    box.insertAdjacentHTML('afterbegin', `<svg class="road" aria-hidden="true"><path class="way" d="${d}"/><path class="stones" d="${d}"/></svg>`);
  }
  return { road };
})();
