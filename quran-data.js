// the surahs of Juz' Amma and the child's memorisation, shared by the web's Quran Oasis and the phone's;
// base: where the site's files are from the calling page ('' or '../').
const Quran = (() => {
  // from An-Nas up to An-Naba' (the admin sets the order): number, name, verses
  const SURAS = [[114, 'الناس', 6], [113, 'الفلق', 5], [112, 'الإخلاص', 4], [111, 'المسد', 5], [110, 'النصر', 3], [109, 'الكافرون', 6], [108, 'الكوثر', 3], [107, 'الماعون', 7], [106, 'قريش', 4], [105, 'الفيل', 5], [104, 'الهمزة', 9], [103, 'العصر', 3], [102, 'التكاثر', 8], [101, 'القارعة', 11], [100, 'العاديات', 11], [99, 'الزلزلة', 8], [98, 'البينة', 8], [97, 'القدر', 5], [96, 'العلق', 19], [95, 'التين', 8], [94, 'الشرح', 8], [93, 'الضحى', 11], [92, 'الليل', 21], [91, 'الشمس', 15], [90, 'البلد', 20], [89, 'الفجر', 30], [88, 'الغاشية', 26], [87, 'الأعلى', 19], [86, 'الطارق', 17], [85, 'البروج', 22], [84, 'الانشقاق', 25], [83, 'المطففين', 36], [82, 'الانفطار', 19], [81, 'التكوير', 29], [80, 'عبس', 42], [79, 'النازعات', 46], [78, 'النبأ', 40]];
  // the child's memorisation: 'ok' complete, a percentage while memorising, nothing when not started
  // percentage = (completed stages + share of verses in the current stage) / 3 stages
  const STATE = { 114: 'ok', 113: 'ok', 112: 83 };
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const verses = (n) => `${ar(n)} ${n >= 3 && n <= 10 ? 'آيات' : 'آية'}`;
  const count = (n) => (n === 1 ? 'سورة واحدة' : n === 2 ? 'سورتين' : n <= 10 ? `${ar(n)} سور` : `${ar(n)} سورة`);
  const done = SURAS.filter(([n]) => STATE[n] === 'ok').length;

  // each surah as both pages show it; filter: '' all, 'on' memorising, 'ok' complete. In the prototype only Al-Ikhlas opens.
  function list(filter = '', base = '') {
    return SURAS.filter(([n]) => !filter || (filter === 'ok' ? STATE[n] === 'ok' : typeof STATE[n] === 'number')).map(([n, name, v]) => {
      const s = STATE[n], on = typeof s === 'number';
      return `<a class="sura ${s === 'ok' ? 'done' : on ? 'now' : ''}" href="${n === 112 ? base + 'surah.html?s=112' : '#'}" aria-label="سورة ${name}، ${verses(v)}، ${s === 'ok' ? 'مكتملة' : on ? `جاري الحفظ ${s}%` : 'لم يبدأ'}">
        <span class="num" aria-hidden="true"><span>${ar(n)}</span></span>
        <span class="t"><b>سورة ${name}</b><small>${verses(v)}</small>${on ? `<span class="meter" style="--p:${s}%"><i></i></span>` : ''}</span>
        ${s === 'ok' ? '<span class="state ok">✓ مكتملة</span>' : on ? `<span class="state on">جاري الحفظ ${ar(s)}٪</span>` : ''}</a>`;
    }).join('');
  }
  // «حفظت ... من ...» with its meter
  const sum = () => `حفظت ${count(done)} من ${ar(SURAS.length)} <span class="meter" style="--p:${(done / SURAS.length) * 100}%"><i></i></span>`;
  return { SURAS, STATE, ar, verses, list, sum };
})();
