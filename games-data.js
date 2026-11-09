// the worlds and games of «كثبان الألعاب», shared by the web's dunes and the phone's;
// worlds and games come from the admin (name, cover, short description, order, and the game's place in the world picture);
// state is the child's: 'ok' done, 'new', '1/2' stage reached, or '' not started.
// base: where the site's files are from the calling page ('' or '../').
const Dunes = (() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const count = (n) => (n > 2 ? `${ar(n)} ألعاب` : n === 2 ? 'لعبتين' : 'لعبة واحدة');
  const label = (s) => (s === 'ok' ? 'مكتملة' : s === 'new' ? 'جديدة' : s ? `المرحلة ${ar(s.split('/')[0])} من ${ar(s.split('/')[1])}` : '');
  const tag = (s) => (s ? `<span class="tag ${s === 'ok' ? 'ok' : s === 'new' ? 'new' : 'on'}">${s === 'ok' ? '✓ ' : ''}${label(s)}</span>` : '');
  // what the button on a game says, from where the child is in it
  const act = (s) => (s === 'ok' ? 'العب مرة أخرى' : s && s !== 'new' ? 'أكمل اللعب' : 'العب الآن');
  // a game not built in the prototype yet
  const SOON = 'في النموذج: جرّب «نظّف البحر» و«ازرع نبتة» و«أطعم الحيوانات» و«ابنِ البيت»';

  function worlds(base = '') {
    const g = (id, name, cover, how, at, state = '', href = '') => ({ id, name, cover: `${base}img/games/${cover}.jpg`, how, at, state, href: href ? base + href : '#' });
    const w = (id, name, about, scene, games) => ({ id, name, about, island: `${base}img/games/wi-${id}.png`, scene: `${base}img/games/${scene}.jpg`, games });
    return [
      w('env', 'البيئة', 'نحافظ على الطبيعة نظيفة وجميلة', 'world-env', [
        g('sea', 'نظّف البحر', 'g-01', 'اجمع المخلفات ورتّبها في الحاويات', [13, 74], '2/2', 'game.html?resume=1'),
        g('garden', 'نظّف الحديقة', 'g-02', 'التقط المخلفات من العشب', [50, 74], 'ok'),
        g('plant', 'ازرع نبتة', 'g-03', 'ازرع البذرة واسقها حتى تكبر', [86, 72], 'new', 'game-plant.html')]),
      w('care', 'المسؤولية', 'نهتم بأشيائنا وبمن حولنا', 'world-care', [
        g('feed', 'أطعم الحيوانات', 'g-04', 'أعطِ كل حيوان طعامه المناسب', [27, 78], 'new', 'game-feed.html'),
        g('room', 'رتّب الغرفة', 'g-05', 'ضع كل لعبة في صندوقها', [77, 70]),
        g('honest', 'ماذا يفعل الصادق؟', 'g-09', 'اختر ما يفعله الصادق في كل موقف', [52, 46], 'new', 'game-honest.html')]),
      w('home', 'الوطن', 'نتعرّف على تراث وطننا الجميل', 'world-home', [
        g('trip', 'رحلة في وطني', 'g-06', 'اجمع رموز التراث في المشهد', [44, 62], 'new')]),
      w('craft', 'الإتقان', 'نتقن عملنا خطوة بخطوة', 'world-craft', [
        g('puzzle', 'أكمل الصورة', 'g-07', 'ضع كل قطعة في مكانها الصحيح', [22, 56], 'ok'),
        g('house', 'ابنِ البيت', 'g-08', 'رتّب المكعبات لتبني بيتاً', [71, 52], 'new', 'game-house.html')])
    ];
  }

  // a game the child finished in this browser counts as done; the first one not seen yet is returned,
  // so the picture can change in front of them
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k) => { try { localStorage.setItem(k, '1'); } catch {} } };
  function progress(all) {
    let fresh = null, at = null;
    all.forEach((w) => w.games.forEach((x) => {
      if (!store.get(`ajyal.done.${x.id}`)) return;
      x.state = 'ok';
      if (!store.get(`ajyal.seen.${x.id}`)) { fresh = x; at = w.id; }
    }));
    return { fresh, at, seen: (x) => store.set(`ajyal.seen.${x.id}`) };
  }
  // what the fox says the first time the child sees the changed picture
  const SAY = { sea: 'انظر! البحر صار نظيفاً بفضلك', plant: 'أحسنت! النبتة أزهرت', feed: 'الحيوانات شبعت وهي سعيدة بك', house: 'أحسنت! البيت جاهز على السجادة' };

  // what each game leaves in the picture: the mess before, the result after (sizes are for a picture 1280 wide)
  function art(base = '') {
    const life = (x, y, w, inner, cls = '', d = 0) => `<span class="life ${cls}" style="--x:${x}%;--y:${y}%;--w:${w}px;--d:${d}s">${inner}</span>`;
    const pic = (src) => `<img src="${base}img/games/${src}.png" alt="">`;
    const blk = (c, x, y, w, h, k = '') => `<i class="${k}" style="--c:${c};left:${x}px;top:${y}px;width:${w}px;height:${h}px"></i>`;
    return {
      sea: (s) => (s === 'ok' ? life(8, 56, 90, pic('item-05'), 'bob sparkle')
        : [[6, 46], [17, 52], [9, 63], [4, 80]].slice(0, s && s !== 'new' ? 2 : 4).map(([x, y], n) => life(x, y, 56, pic(`item-0${n + 1}`), 'bob', -n * 0.7)).join('')),
      garden: (s) => (s === 'ok' ? '' : [[44, 62], [56, 66], [62, 58]].map(([x, y], n) => life(x, y, 44, pic(`item-0${n + 1}`))).join('')),
      plant: (s) => life(94, 58.5, 72, pic(s === 'ok' ? 'plant-7' : 'plant-1'), s === 'ok' ? 'sparkle' : ''),
      feed: (s) => [['an-rabbit', 12, 57], ['an-cat', 20, 60], ['an-hen', 28, 56], ['an-sheep', 36, 60]].map(([a, x, y], n) => life(x, y, 84, pic(a), s === 'ok' ? 'happy' : '', -n * 0.6)).join(''),
      house: (s) => life(71, 76, 170, s === 'ok'
        ? blk('#E5484D', 6, 0, 158, 60, 'roof') + blk('#3D96D6', 14, 56, 44, 66, 'win') + blk('#5BC236', 58, 56, 54, 66, 'door') + blk('#3D96D6', 112, 56, 44, 66, 'win') + blk('#F4823F', 0, 120, 170, 20)
        : blk('#F4823F', 10, 104, 120, 20) + blk('#3D96D6', 30, 60, 40, 44, 'win') + blk('#5BC236', 96, 66, 46, 40) + blk('#E5484D', 116, 40, 54, 30, 'roof') + blk('#FFC93C', 70, 88, 60, 16), 'blocks')
    };
  }

  return { worlds, progress, art, SAY, SOON, ar, count, label, tag, act };
})();
