// «سحر نور» in the free drawing: Nour looks at the drawing and says what it looks like, then shows it drawn in a style the child picks
// (in the product the drawing goes to the AI, which draws the child's own picture again in that style; here the guess is made on the
// device by matching the drawing's shape to a few shapes Nour knows, and the drawn pictures are ready ones: nothing leaves the device)
(() => {
  // the shapes Nour knows, each with a few ways a child might draw it (points on a 0..1 square, y down)
  const circle = (cx, cy, rx, ry = rx, a0 = 0, a1 = Math.PI * 2, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const poly = (...p) => p;
  const ring = (...p) => [...p, p[0]];
  const rays = (cx, cy, r0, r1, n, tilt = 0) => Array.from({ length: n }, (_, i) => { const a = tilt + i * Math.PI * 2 / n; return poly([cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]); });
  const star = (cx, cy, R, r) => ring(...Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R; return [cx + k * Math.cos(a), cy + k * Math.sin(a)]; }));
  const mirror = (strokes) => strokes.map((s) => s.map(([x, y]) => [1 - x, y]));
  const petals = (cx, cy, d, r, n) => Array.from({ length: n }, (_, i) => { const a = i * Math.PI * 2 / n; return circle(cx + d * Math.cos(a), cy + d * Math.sin(a), r); });
  const fish = [circle(.4, .5, .3, .18), ring([.68, .5], [.92, .3], [.92, .7]), circle(.24, .45, .03)];
  const car = [ring([.08, .72], [.08, .5], [.25, .48], [.35, .28], [.68, .28], [.78, .48], [.92, .52], [.92, .72]), circle(.28, .76, .1), circle(.72, .76, .1)];

  const SHAPES = [
    { id: 'sun', n: 'شمس', the: 'الشمس', ways: [
      [circle(.5, .5, .22), ...rays(.5, .5, .3, .46, 8)],
      [circle(.5, .5, .25), ...rays(.5, .5, .32, .42, 12, .2)],
      [circle(.5, .5, .3)]] },
    { id: 'house', n: 'بيت', the: 'البيت', ways: [
      [ring([.18, .45], [.82, .45], [.82, .92], [.18, .92]), poly([.1, .48], [.5, .1], [.9, .48]), ring([.42, .92], [.42, .7], [.58, .7], [.58, .92])],
      [ring([.2, .5], [.8, .5], [.8, .92], [.2, .92]), ring([.2, .5], [.5, .14], [.8, .5])],
      [ring([.15, .45], [.85, .45], [.85, .9], [.15, .9]), poly([.15, .45], [.5, .1], [.85, .45]), ring([.25, .55], [.4, .55], [.4, .7], [.25, .7]), ring([.55, .9], [.55, .65], [.7, .65], [.7, .9])]] },
    { id: 'tree', n: 'شجرة', the: 'الشجرة', ways: [
      [circle(.5, .36, .3), poly([.44, .64], [.44, .96]), poly([.56, .64], [.56, .96])],
      [circle(.5, .3, .26, .24), ring([.43, .54], [.57, .54], [.57, .96], [.43, .96])],
      [ring([.5, .05], [.85, .72], [.15, .72]), ring([.44, .72], [.56, .72], [.56, .96], [.44, .96])]] },
    { id: 'flower', n: 'وردة', the: 'الوردة', ways: [
      [circle(.5, .3, .09), ...petals(.5, .3, .17, .09, 6), poly([.5, .48], [.5, .96]), circle(.62, .74, .08, .04)],
      [circle(.5, .32, .1), ...petals(.5, .32, .19, .1, 5), poly([.5, .52], [.5, .96])],
      [circle(.5, .28, .08), ...petals(.5, .28, .15, .08, 8), poly([.5, .44], [.5, .96]), circle(.38, .72, .08, .04), circle(.62, .66, .08, .04)],
      [circle(.5, .25, .07), ...petals(.5, .25, .14, .075, 6), poly([.5, .4], [.5, .96])]] },
    { id: 'fish', n: 'سمكة', the: 'السمكة', ways: [fish, mirror(fish), [circle(.42, .5, .32, .2), poly([.72, .5], [.94, .32], [.94, .68], [.72, .5])]] },
    { id: 'balloon', n: 'بالون', the: 'البالون', ways: [
      [circle(.5, .32, .24, .28), poly([.5, .6], [.46, .7], [.54, .8], [.46, .9], [.5, .98])],
      [circle(.5, .3, .22), poly([.5, .52], [.5, .98])]] },
    { id: 'cat', n: 'قطة', the: 'القطة', ways: [
      [circle(.5, .56, .32, .28), poly([.24, .4], [.22, .1], [.42, .3]), poly([.58, .3], [.78, .1], [.76, .4]), circle(.38, .52, .03), circle(.62, .52, .03), poly([.1, .6], [.32, .64]), poly([.68, .64], [.9, .6])],
      [circle(.5, .56, .32, .3), poly([.25, .38], [.25, .12], [.45, .28]), poly([.55, .28], [.75, .12], [.75, .38])]] },
    { id: 'car', n: 'سيارة', the: 'السيارة', ways: [car, mirror(car),
      [ring([.06, .45], [.94, .45], [.94, .72], [.06, .72]), ring([.25, .45], [.32, .25], [.68, .25], [.75, .45]), circle(.27, .76, .1), circle(.73, .76, .1)]] },
    { id: 'star', n: 'نجمة', the: 'النجمة', ways: [
      [star(.5, .53, .46, .19)],
      [ring([.2, .92], [.5, .06], [.8, .92], [.06, .38], [.94, .38])]] }
  ];

  // a drawing becomes a cloud of points: the inked pixels, fitted in a small square, then a fixed number of them
  const G = 48, N = 72;
  const sheet = document.createElement('canvas'), sctx = sheet.getContext('2d', { willReadFrequently: true });
  function cloud(src, sw, sh) {
    // the inked part of the drawing (anything not near white)
    sheet.width = Math.round(sw * 96 / Math.max(sw, sh)); sheet.height = Math.round(sh * 96 / Math.max(sw, sh));
    sctx.fillStyle = '#FFFFFF'; sctx.fillRect(0, 0, sheet.width, sheet.height);
    sctx.drawImage(src, 0, 0, sheet.width, sheet.height);
    const big = sctx.getImageData(0, 0, sheet.width, sheet.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < sheet.height; y++) for (let x = 0; x < sheet.width; x++) {
      const i = (y * sheet.width + x) * 4;
      if (big[i] + big[i + 1] + big[i + 2] < 720) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return null;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, k = (G - 2) / Math.max(w, h);
    const img = sctx.getImageData(x0, y0, w, h);
    sheet.width = sheet.height = G;
    sctx.fillStyle = '#FFFFFF'; sctx.fillRect(0, 0, G, G);
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; tmp.getContext('2d').putImageData(img, 0, 0);
    sctx.drawImage(tmp, (G - w * k) / 2, (G - h * k) / 2, w * k, h * k);
    const d = sctx.getImageData(0, 0, G, G).data, pts = [];
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { const i = (y * G + x) * 4; if (d[i] + d[i + 1] + d[i + 2] < 690) pts.push([x, y]); }
    if (pts.length < 12) return null;
    // evenly spread picks, then centred and scaled so size and place do not matter
    const pick = Array.from({ length: N }, (_, i) => pts[Math.floor((i + .5) * pts.length / N)]);
    const cx = pick.reduce((s, p) => s + p[0], 0) / N, cy = pick.reduce((s, p) => s + p[1], 0) / N;
    return pick.map(([x, y]) => [(x - cx) / G, (y - cy) / G]);
  }
  // the shapes, drawn the same way a child's stroke looks, become clouds the same way
  const pad = document.createElement('canvas'); pad.width = pad.height = 240;
  const padCtx = pad.getContext('2d');
  SHAPES.forEach((s) => { s.clouds = s.ways.map((way) => {
    padCtx.fillStyle = '#FFFFFF'; padCtx.fillRect(0, 0, 240, 240);
    padCtx.strokeStyle = '#000000'; padCtx.lineWidth = 9; padCtx.lineCap = padCtx.lineJoin = 'round';
    way.forEach((st) => { padCtx.beginPath(); st.forEach(([x, y], i) => (i ? padCtx.lineTo(10 + x * 220, 10 + y * 220) : padCtx.moveTo(10 + x * 220, 10 + y * 220))); padCtx.stroke(); });
    return cloud(pad, 240, 240);
  }); });

  // how far one cloud is from another: every point takes the nearest point still free, starting from a few places, the best kept
  // (the point-cloud matching of the $P recognizer, Vatavu, Anthony and Wobbrock, 2012)
  function far(a, b, start) {
    const used = new Array(N).fill(false); let sum = 0, i = start;
    do {
      let best = Infinity, j = -1;
      for (let k = 0; k < N; k++) if (!used[k]) { const d = (a[i][0] - b[k][0]) ** 2 + (a[i][1] - b[k][1]) ** 2; if (d < best) { best = d; j = k; } }
      used[j] = true; sum += (1 - ((i - start + N) % N) / N) * Math.sqrt(best); i = (i + 1) % N;
    } while (i !== start);
    return sum;
  }
  const match = (a, b) => { let m = Infinity; for (let s = 0; s < N; s += 9) m = Math.min(m, far(a, b, s), far(b, a, s)); return m; };

  // the shapes from the closest to the farthest (null when there is too little drawn)
  function guess(canvas) {
    const c = cloud(canvas, canvas.width, canvas.height);
    if (!c) return null;
    return SHAPES.map((s) => ({ s, d: Math.min(...s.clouds.map((t) => match(c, t))) })).sort((x, y) => x.d - y.d).map((x) => x.s);
  }

  const STYLES = [{ id: 'cartoon', n: 'كرتوني' }, { id: 'real', n: 'واقعي' }];
  const picture = (shape, style, base = '') => `${base}img/magic/${style}-${shape.id}.jpg`;

  // how many times are left until the subscription renews, and whether the parent left the feature on
  // (for the prototype: ?off=draw switches it off for the visit, as in the magic workshop)
  const OF = 5, USED = 1, KEY = 'ajyal.ai';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const left = () => Math.max(0, OF - USED - (read().draw || 0));
  const spend = () => { const v = read(); v.draw = (v.draw || 0) + 1; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const q = new URLSearchParams(location.search);
  if (q.has('off')) { try { sessionStorage.setItem('ajyal.ai.off', q.get('off')); } catch {} }
  const open = () => { let o = ''; try { o = sessionStorage.getItem('ajyal.ai.off') || ''; } catch {} return !o.split(',').includes('draw'); };
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const count = () => { const n = left(); return n === 0 ? 'انتهت مرات السحر الآن' : n === 1 ? 'باقي مرة سحر واحدة' : n === 2 ? 'باقي مرتا سحر' : `باقي ${ar(n)} مرات سحر`; };

  window.Magic = { SHAPES, STYLES, guess, picture, left, spend, open, count };
})();
