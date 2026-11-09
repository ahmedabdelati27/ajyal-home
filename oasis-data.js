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
  return { sets, learn, NAME, RESUME };
})();
