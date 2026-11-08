// shared by «غرفتي» and «المتصدرون»: the child's profile, points, badges, progress and the general leaderboard
// (in the product all of this comes from the child's file and the points system; here the name and picture the child edits are kept on this device)
(() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  // points are written the way the bar at the top of every page writes them (3,240)
  const num = (n) => n.toLocaleString('en-US');

  // the child may change the name and the picture only; the rest comes from the parent's account
  const KEY = 'ajyal.profile';
  const BASE = { name: 'يوسف', avatar: 'A-03', age: 8, xp: 3240, level: 7, from: 2800, to: 4000, streak: 5 };
  const read = () => { try { return { ...BASE, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...BASE }; } };
  const save = (v) => { try { const { name, avatar } = v; localStorage.setItem(KEY, JSON.stringify({ name, avatar })); return true; } catch { return false; } };
  const AVATARS = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08'];

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
    ['لين', 'A-04', 5860, 'S-02'], ['عمر', 'A-01', 5420, 'S-06'], ['جود', 'A-06', 5105, 'S-01'], ['سلطان', 'A-05', 4790, 'S-05'],
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

  window.Profile = { ar, num, read, save, AVATARS, BADGES, LEADERS, ME_RANK, STREAK, LEVELS, EARN };
})();
