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
  const BADGES = [
    { id: 'S-01', n: 'صديق الحكايات', how: 'أنهِ ٣ قصص', got: true },
    { id: 'S-02', n: 'نجم القرآن', how: 'أكمل ٣ سور', got: true },
    { id: 'S-03', n: 'بطل الحروف', how: 'أكمل ١٠ حروف', got: false },
    { id: 'S-04', n: 'الفنان الصغير', how: 'تُعتمد رسمة لك للنشر', got: true },
    { id: 'S-05', n: 'زارع القيم', how: 'أكمل قيمة في الحديقة', got: true },
    { id: 'S-06', n: 'شعلة الأيام', how: 'العب ٥ أيام متتالية', got: true },
    { id: 'S-07', n: 'بطل القمة', how: 'تفوز مشاركتك في مسابقة', got: false },
    { id: 'S-08', n: 'المستكشف', how: 'أكمل ٣ فيديوهات وكتب', got: true }
  ];

  // the general leaderboard: one list by total points, with child-friendly data only
  const LEADERS = [
    ['لين', 'A-04', 5860, 'S-02'], ['عمر', 'A-01', 5420, 'S-06'], ['جود', 'A-06', 5105, 'S-01'], ['سلطان', 'A-05', 4790, 'S-05'],
    ['ريم', 'A-02', 4460, 'S-04'], ['فيصل', 'A-07', 4120, 'S-08'], ['هيا', 'A-08', 3905, 'S-01'], ['ناصر', 'A-05', 3720, 'S-06'],
    ['مريم', 'A-06', 3560, 'S-04'], ['خالد', 'A-01', 3410, 'S-02'], ['دانة', 'A-02', 3300, 'S-05']
  ].map(([name, avatar, xp, badge], i) => ({ rank: i + 1, name, avatar, xp, badge }));
  const ME_RANK = 12;

  window.Profile = { ar, num, read, save, AVATARS, BADGES, LEADERS, ME_RANK };
})();
