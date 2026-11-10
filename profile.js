// shared by «غرفتي» and «المتصدرون»: the child's profile, points, badges, progress and the general leaderboard
// (in the product all of this comes from the child's file and the points system; here the name and picture the child edits are kept on this device)
(() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  // points are written the way the bar at the top of every page writes them (3,240)
  const num = (n) => n.toLocaleString('en-US');

  // the child may change the name and the picture only; the rest comes from the parent's account
  const KEY = 'ajyal.profile';
  const BASE = { name: 'عمر', avatar: 'A-03', age: 8, xp: 3240, level: 7, from: 2800, to: 4000, streak: 5 };
  const read = () => { try { return { ...BASE, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...BASE }; } };
  const save = (v) => { try { const { name, avatar, photo } = v; localStorage.setItem(KEY, JSON.stringify(photo ? { name, avatar, photo } : { name, avatar })); return true; } catch { return false; } };
  const AVATARS = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08'];

  // the child's picture: a photo of their own if they added one, otherwise the drawn picture (the avatar).
  // Every child keeps an avatar: it is what other children see on the leaderboard; the photo shows only on the child's own places
  const face = (me, base = '') => me.photo || `${base}img/avatars/${me.avatar}.png`;
  // the parent decides whether pictures may be uploaded (for the prototype: ?photos=off, kept for the visit)
  const photosOk = () => {
    const q = new URLSearchParams(location.search);
    try { if (q.has('photos')) sessionStorage.setItem('ajyal.photos', q.get('photos')); return sessionStorage.getItem('ajyal.photos') !== 'off'; } catch { return q.get('photos') !== 'off'; }
  };
  // a photo is kept small: its middle square, 240 pixels across
  const shrink = (file) => new Promise((ok, no) => {
    const url = URL.createObjectURL(file), i = new Image();
    i.onload = () => {
      const s = Math.min(i.naturalWidth, i.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 240;
      c.getContext('2d').drawImage(i, (i.naturalWidth - s) / 2, (i.naturalHeight - s) / 2, s, s, 0, 0, 240, 240);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.82));
    };
    i.onerror = () => { URL.revokeObjectURL(url); no(); };
    i.src = url;
  });
  const CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/></svg>';
  const CSS = `.pick .photo { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; padding: 10px; border-radius: 22px; background: #FFF6E8; }
.pick .ph { flex-shrink: 0; display: grid; place-items: center; width: 74px; height: 74px; border-radius: 50%; overflow: hidden; background: #FFFFFF; color: #B07A00; box-shadow: 0 0 0 3px #F1DEC2; }
.pick .ph.on { box-shadow: 0 0 0 4px var(--accent, #E58A2B); }
.pick .ph img { width: 100%; height: 100%; object-fit: cover; }
.pick .ph svg { width: 34px; height: 34px; }
.pick .photo b { display: block; font-size: 16px; font-weight: 800; }
.pick small { display: block; font-size: 13px; font-weight: 700; color: #6B5A48; }
.pick small.lock { margin-top: 4px; color: #8A5A00; }
.pick .ph-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pick .ph-btns button { height: 38px; padding: 0 14px; border: 0; border-radius: 999px; background: #FFFFFF; font: inherit; font-size: 14px; font-weight: 800; color: #3A2318; box-shadow: 0 0 0 2px #F1DEC2, 0 3px 0 #F1DEC2; cursor: pointer; }
.pick .ph-btns .drop { color: #A13A2E; }
.pick .sub { display: block; margin-bottom: 4px; font-size: 15px; font-weight: 800; }
.pick .sub small { display: inline; margin-inline-start: 4px; }`;
  // the picture part of «غيّر اسمك وصورتك»: the child's photo (add, change or remove), then the drawn pictures; get() gives what was picked
  function pick(host, me, base = '') {
    if (!document.getElementById('pick-css')) document.head.insertAdjacentHTML('beforeend', `<style id="pick-css">${CSS}</style>`);
    let photo = me.photo || '', avatar = me.avatar;
    const ok = photosOk();
    const draw = () => {
      host.classList.add('pick');
      host.innerHTML = `<div class="photo"><span class="ph${photo ? ' on' : ''}">${photo ? '<img src="' + photo + '" alt="صورتك">' : CAM}</span>
        <div><b>صورتك الحقيقية</b><small>تظهر لك ولولي أمرك فقط</small>
        ${ok ? `<div class="ph-btns"><button type="button" data-ph="add">${photo ? 'غيّر الصورة' : 'أضف صورة'}</button>${photo ? '<button type="button" class="drop" data-ph="drop">احذفها</button>' : ''}</div>`
          : `<small class="lock">${photo ? 'رفع صورة جديدة يحتاج إذن ولي أمرك أو معلّمك' : 'رفع الصور يحتاج إذن ولي أمرك أو معلّمك'}</small>${photo ? '<div class="ph-btns"><button type="button" class="drop" data-ph="drop">احذفها</button></div>' : ''}`}</div>
        <input type="file" accept="image/*" hidden></div>
        <span class="sub">صورتك الرمزية<small>${photo ? 'يراها الأطفال الآخرون في المتصدرين' : 'تظهر لك وللأطفال الآخرين في المتصدرين'}</small></span>
        <div class="faces" role="group" aria-label="صورتك الرمزية">${AVATARS.map((a, n) => `<button type="button" data-a="${a}" aria-pressed="${a === avatar}" aria-label="صورة رمزية ${ar(n + 1)}"><img src="${base}img/avatars/${a}.png" alt=""></button>`).join('')}</div>`;
    };
    host.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a) { avatar = b.dataset.a; host.querySelectorAll('[data-a]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
      if (b.dataset.ph === 'add') host.querySelector('input[type=file]').click();
      if (b.dataset.ph === 'drop') { photo = ''; draw(); host.querySelector('[data-ph="add"]')?.focus(); }
    };
    host.onchange = (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      shrink(f).then((p) => { photo = p; draw(); host.querySelector('[data-ph="add"]')?.focus(); }, () => {});
    };
    draw();
    return { get: () => ({ photo, avatar }) };
  }

  // badges and achievements are one system; the admin sets each one's name, picture and condition
  // about: the admin's short description; how: the condition; prog: how far the child is when it can be counted; go: where to earn it
  const BADGES = [
    { id: 'S-01', n: 'صديق الحكايات', about: 'لمن يحب القصص ويفهمها', how: 'أنهِ ٣ قصص مع أسئلتها', got: true, go: ['beach.html', 'شاطئ الحكايات'] },
    { id: 'S-02', n: 'نجم القرآن', about: 'لمن يحفظ سور جزء عمّ', how: 'سمّع سورتين كاملتين', got: true, go: ['quran.html', 'واحة القرآن'] },
    { id: 'S-03', n: 'بطل الحروف', about: 'لمن يتعلّم الحروف والأرقام', how: 'أكمل رحلة ١٠ حروف أو أرقام', got: false, prog: [7, 10], go: ['oasis.html', 'واحة الحروف'] },
    { id: 'S-04', n: 'الفنان الصغير', about: 'لمن يشارك رسوماته الجميلة', how: 'أرسل رسمة للنشر، ويعتمدها فريق أجيال', got: true, go: ['colors.html', 'وادي الألوان'] },
    { id: 'S-05', n: 'زارع القيم', about: 'لمن يزرع القيم مع نور', how: 'أكمل رحلة قيمة واحدة في الحديقة', got: true, go: ['garden.html', 'حديقة القيم'] },
    { id: 'S-06', n: 'شعلة الأيام', about: 'لمن يزور عالم أجيال كل يوم', how: 'ادخل ٥ أيام متتالية', got: true, go: null },
    { id: 'S-07', n: 'بطل القمة', about: 'لمن يفوز في مسابقة مستمرة', how: 'تحصل مشاركتك على أعلى الأصوات في مسابقة', got: false, need: 'contests', go: ['peak.html', 'قمة الأبطال'] },
    { id: 'S-08', n: 'المستكشف', about: 'لمن يحب أن يتعلّم أشياء جديدة', how: 'أكمل ٣ فيديوهات أو كتب في الغابة', got: true, go: ['forest.html', 'غابة المعرفة'] }
  ];

  // the general leaderboard: one list by total points, with child-friendly data only
  const LEADERS = [
    ['لين', 'A-04', 5860, 'S-02'], ['يزن', 'A-01', 5420, 'S-06'], ['جود', 'A-06', 5105, 'S-01'], ['سلطان', 'A-05', 4790, 'S-05'],
    ['ريم', 'A-02', 4460, 'S-04'], ['فيصل', 'A-07', 4120, 'S-08'], ['هيا', 'A-08', 3905, 'S-01'], ['ناصر', 'A-05', 3720, 'S-06'],
    ['مريم', 'A-06', 3560, 'S-04'], ['خالد', 'A-01', 3410, 'S-02'], ['دانة', 'A-02', 3300, 'S-05']
  ].map(([name, avatar, xp, badge], i) => ({ rank: i + 1, name, avatar, xp, badge }));
  const ME_RANK = 12;

  // days in a row: counted for the child automatically; the last seven days end today (Sunday 8 November in the prototype)
  // goals: the days the admin may tie to a badge; the others are only steps to aim for
  const STREAK = { now: 5, best: 9,
    week: [['الإثنين', 2, true], ['الثلاثاء', 3, false], ['الأربعاء', 4, true], ['الخميس', 5, true], ['الجمعة', 6, true], ['السبت', 7, true], ['الأحد', 8, true]],
    goals: [{ d: 3 }, { d: 5, badge: 'S-06' }, { d: 7 }, { d: 14 }, { d: 30 }] };

  // levels: the admin sets each one's number and the points that reach it; a level opens nothing, it only cheers
  const LEVELS = [0, 100, 300, 600, 1000, 1800, 2800, 4000, 5500, 7500];
  // the activities the admin made worth points, with their value (the prototype's numbers)
  const EARN = [
    { n: 'إكمال قصة مع أسئلتها', xp: 30, img: 'img/beach.png', go: ['beach.html', 'شاطئ الحكايات'] },
    { n: 'إكمال حرف أو رقم', xp: 20, img: 'img/letters.png', go: ['oasis.html', 'واحة الحروف'] },
    { n: 'إكمال سورة', xp: 40, img: 'img/quran.png', go: ['quran.html', 'واحة القرآن'] },
    { n: 'إكمال لعبة', xp: 20, img: 'img/games.png', go: ['games.html', 'كثبان الألعاب'] },
    { n: 'إكمال قيمة في الحديقة', xp: 50, img: 'img/garden.png', go: ['garden.html', 'حديقة القيم'] },
    { n: 'المشاركة في مسابقة', xp: 10, img: 'img/peak.png', go: ['peak.html', 'قمة الأبطال'], need: 'contests' },
    { n: 'اعتماد إبداعك للنشر', xp: 25, img: 'img/colors.png', go: ['index.html?open=room&tab=works', 'إبداعاتي'] }
  ];

  window.Profile = { ar, num, read, save, AVATARS, face, photosOk, pick, BADGES, LEADERS, ME_RANK, STREAK, LEVELS, EARN };
})();
