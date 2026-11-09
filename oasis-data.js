// what the admin puts in the Letters Oasis, shared by the web's oasis and the phone's.
// The admin sets the order; states per child: '' not started, 'now' learning (several can be), a star count when done;
// last = the item the child reached last. base: where the site's files are from the calling page ('' or '../').
const Oasis = (() => {
  const sets = () => ({
    'ar-l': { title: 'حروف اللغة العربية', unit: 'حرف', items: 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' '), state: { 'ا': 3, 'ب': 'now', 'ج': 'now' }, last: 'ب' },
    'ar-n': { title: 'الأرقام بالعربية', unit: 'رقم', items: '١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ١٠'.split(' '), state: { '١': 3, '٢': 2, '٣': 'now' }, last: '٣' },
    'en-l': { title: 'English letters', unit: 'حرف', items: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' '), state: {} },
    'en-n': { title: 'English numbers', unit: 'رقم', items: '1 2 3 4 5 6 7 8 9 10'.split(' '), state: {} }
  });
  // items that have a full learning journey in the prototype
  const learn = (base = '') => ({ 'ب': base + 'learn.html?k=l&id=ب', '٣': base + 'learn.html?k=n&id=٣' });
  const NAME = { 'ب': 'حرف الباء', '٣': 'رقم ثلاثة' };
  // where the child stopped inside the item they reached last
  const RESUME = { step: 'الخطوة 4 من 6: التتبّع', p: 50 };

  // what each letter and number is called, so the child can find it by its name, typed or said
  const CALL = {
    'ar-l': 'ألف باء تاء ثاء جيم حاء خاء دال ذال راء زاي سين شين صاد ضاد طاء ظاء عين غين فاء قاف كاف لام ميم نون هاء واو ياء'.split(' '),
    'ar-n': 'واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة'.split(' '),
    'en-l': 'إيه بي سي دي إي إف جي إتش آي جيه كيه إل إم إن أو بي كيو آر إس تي يو في دبليو إكس واي زد'.split(' '),
    'en-n': 'one two three four five six seven eight nine ten'.split(' ')
  };
  // the tile's colour for each state, as on the oasis trail
  const TINT = { done: '#D9F2C7', now: '#FFD978', '': '#F7E7C6' };
  // the letter's shape as shown: «ه» alone looks like the figure five, so it is shown as «هـ» (the search ignores the tatweel)
  const shape = (x) => (x === 'ه' ? 'هـ' : x);
  // a small tile with the letter or number on it, for the search results
  const tile = (x, cls) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 60"><rect width="84" height="60" fill="${TINT[cls]}"/>`
    + `<text x="42" y="31" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-weight="700" font-size="${x.length > 1 ? 30 : 38}" fill="#3A2318">${x}</text></svg>`);
  // every letter and number in the oasis, for its search: the Arabic letters first, then the Arabic numbers, then English.
  // The ones with a learning journey in the prototype open it, like their tiles; the rest are not in the prototype yet
  function searchItems(base = '') {
    const S = sets(), L = learn(base);
    return ['ar-l', 'ar-n', 'en-l', 'en-n'].flatMap((id, rank) => S[id].items.map((x, i) => {
      const call = CALL[id][i], s = S[id].state[x], cls = s === 'now' ? 'now' : typeof s === 'number' ? 'done' : '';
      const ar = id.startsWith('ar'), letter = id.endsWith('l');
      // an Arabic number shows its figure too, so a typed figure finds the Arabic one before the English one
      const title = id === 'ar-l' ? `حرف ال${call}` : id === 'ar-n' ? `رقم ${call} ${x}` : `${letter ? 'حرف' : 'رقم'} ${x}`;
      const set = `${letter ? 'الحروف' : 'الأرقام'} ${ar ? 'العربية' : 'الإنجليزية'}`;
      const note = cls === 'done' ? 'أكملته' : cls === 'now' ? 'أتعلّمه الآن' : '';
      return { title, img: tile(shape(x), cls), href: L[x], rank,
        sub: [set, id === 'ar-l' ? shape(x) : ar ? '' : call, note].filter(Boolean).join(' · '),
        words: [x, call, letter ? 'حرف' : 'رقم', letter ? 'حروف' : 'أرقام', ...(id === 'en-n' ? [CALL['ar-n'][i]] : [])] };
    }));
  }
  return { sets, learn, NAME, RESUME, searchItems };
})();
