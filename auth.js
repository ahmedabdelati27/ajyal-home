// the account side of the prototype: who is signed in, their children, and the checks on every field.
// Nothing leaves this device, and passwords are never kept: any registered email or mobile with a password of 8 or more characters gets in.
const Auth = (() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const del = (k) => { try { localStorage.removeItem(k); } catch {} };

  // the account the prototype knows before anyone signs up here, with three children, one of them playing on another device
  const DEMO = { type: 'parent', name: 'أحمد العتيبي', email: 'ahmed@example.com', phone: '0551234567' };
  const DEMO_KIDS = [
    { id: 'k1', name: 'يوسف', birth: '2018-03-14', gender: 'boy', avatar: 'A-03' },
    { id: 'k2', name: 'مريم', birth: '2020-09-02', gender: 'girl', avatar: 'A-06' },
    { id: 'k3', name: 'عمر', birth: '2014-11-20', gender: 'boy', avatar: 'A-05', busy: true }
  ];
  // the package in the prototype allows four children
  const LIMIT = 4;
  const AVATARS = { boy: ['A-03', 'A-01', 'A-05', 'A-07'], girl: ['A-06', 'A-02', 'A-04', 'A-08'] };

  const account = () => get('ajyal.account', null);
  const known = () => [DEMO, account()].filter(Boolean);
  const signedIn = () => get('ajyal.signed', null);
  // each account keeps its own children; the demo account starts with its three
  const kids = () => { const me = signedIn(), all = get('ajyal.kids', {}); return (me && all[me.email]) || (me && me.email === DEMO.email ? DEMO_KIDS : []); };

  // the checks the form runs as the parent types
  const norm = (s) => String(s || '').trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, '');
  const isPhone = (s) => /^05\d{8}$/.test(norm(s));
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
  const taken = (s) => known().some((a) => a.email.toLowerCase() === String(s).trim().toLowerCase() || a.phone === norm(s));
  const age = (birth) => { const b = new Date(birth), t = new Date(); let y = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) y--; return y; };
  const years = (y) => (y === 1 ? 'سنة واحدة' : y === 2 ? 'سنتان' : y <= 10 ? `${ar(y)} سنوات` : `${ar(y)} سنة`);

  function signIn(id) {
    const a = known().find((x) => x.email.toLowerCase() === String(id).trim().toLowerCase() || x.phone === norm(id));
    if (!a) return null;
    set('ajyal.signed', { name: a.name, type: a.type, org: a.org || '', email: a.email });
    return a;
  }
  function register(a) { set('ajyal.account', a); set('ajyal.signed', { name: a.name, type: a.type, org: a.org || '', email: a.email }); }
  function addKid(k) {
    const list = [...kids(), { id: 'k' + Date.now(), ...k }], all = get('ajyal.kids', {});
    all[signedIn().email] = list; set('ajyal.kids', all); return list;
  }
  const signOut = () => del('ajyal.signed');

  // a field's message under it; returns whether the field is fine
  function mark(field, msg) {
    const box = field.closest('.field'); if (!box) return !msg;
    box.classList.toggle('bad', !!msg);
    const e = box.querySelector('.err'); if (e) e.textContent = msg || '';
    field.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }
  // the eye beside a password shows or hides it
  function eyes(root = document) {
    root.querySelectorAll('.eye').forEach((b) => b.addEventListener('click', () => {
      const i = b.parentElement.querySelector('input'), show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      b.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      b.setAttribute('aria-pressed', String(show));
    }));
  }
  const toast = (s, ms = 2800) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = s; el.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), ms); };

  // the «add a child» form, shared by sign-up and the children's page
  const EYE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  function kidForm(host, { onDone, later }) {
    const today = new Date().toISOString().slice(0, 10);
    host.innerHTML = `<form class="form" novalidate>
      <div class="field"><label for="k-name">اسم الطفل</label><div class="input"><input id="k-name" autocomplete="off" maxlength="30" required></div><p class="err"></p></div>
      <div class="row2">
        <div class="field"><label for="k-birth">تاريخ الميلاد</label><div class="input"><input id="k-birth" type="date" max="${today}" required></div><p class="err"></p></div>
        <div class="field"><label for="k-gender">الجنس</label><div class="input"><select id="k-gender" required><option value="">اختر</option><option value="boy">ولد</option><option value="girl">بنت</option></select></div><p class="err"></p></div>
      </div>
      <p style="margin:-6px 0 0"><span class="age" id="k-age" aria-live="polite"></span></p>
      <div class="field"><span class="label" style="font-size:15px;font-weight:800">صورة الطفل <span class="opt">(اختياري)</span></span>
        <div class="faces" id="k-faces" role="group" aria-label="صورة الطفل"></div>
        <input type="file" id="k-file" accept="image/*" hidden>
        <p class="hint">اختر رسمة، أو ارفع صورة لطفلك.</p></div>
      <button class="btn main" type="submit">أضف الطفل</button>
      ${later ? '<button class="btn link" type="button" data-later>سأضيف أطفالي لاحقاً</button>' : ''}
    </form>`;
    const $ = (s) => host.querySelector(s);
    let pic = 'A-03', photo = '';
    const drawFaces = (g) => {
      const list = g ? AVATARS[g] : [...AVATARS.boy.slice(0, 2), ...AVATARS.girl.slice(0, 2)];
      if (!photo && !list.includes(pic)) pic = list[0];
      $('#k-faces').innerHTML = list.map((a) => `<button class="face" type="button" data-a="${a}" aria-pressed="${!photo && a === pic}" aria-label="رسمة ${ar(list.indexOf(a) + 1)}"><img src="img/avatars/${a}.png" alt=""></button>`).join('')
        + `<button class="face up" type="button" data-up aria-pressed="${!!photo}" aria-label="ارفع صورة">${photo ? `<img src="${photo}" alt="">` : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'}</button>`;
    };
    drawFaces('');
    $('#k-faces').addEventListener('click', (e) => {
      const b = e.target.closest('.face'); if (!b) return;
      if (b.dataset.up !== undefined) return $('#k-file').click();
      pic = b.dataset.a; photo = ''; drawFaces($('#k-gender').value);
    });
    $('#k-file').addEventListener('change', () => {
      const f = $('#k-file').files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { photo = r.result; drawFaces($('#k-gender').value); }; r.readAsDataURL(f);
    });
    $('#k-gender').addEventListener('change', () => { mark($('#k-gender'), ''); drawFaces($('#k-gender').value); });
    // the age appears as soon as the birth date is in; the platform is for 3 to 15
    $('#k-birth').addEventListener('change', () => {
      const v = $('#k-birth').value, a = $('#k-age');
      if (!v) { a.textContent = ''; return; }
      const y = age(v); mark($('#k-birth'), '');
      a.classList.toggle('warn', y < 3 || y > 15);
      a.textContent = y < 3 || y > 15 ? `العمر ${years(Math.max(y, 0))}. تستهدف المنصة الأطفال من ٣ إلى ١٥ سنة` : `العمر ${years(y)}`;
    });
    host.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#k-name').value.trim(), birth = $('#k-birth').value, gender = $('#k-gender').value;
      const ok = [mark($('#k-name'), name.length < 2 ? 'اكتب اسم الطفل' : ''), mark($('#k-birth'), !birth ? 'اختر تاريخ الميلاد' : birth > today ? 'تاريخ الميلاد لا يكون في المستقبل' : ''), mark($('#k-gender'), !gender ? 'اختر الجنس' : '')].every(Boolean);
      if (!ok) return host.querySelector('[aria-invalid="true"]').focus();
      onDone({ name, birth, gender, avatar: photo ? '' : pic, photo });
    });
    host.querySelector('[data-later]')?.addEventListener('click', () => onDone(null));
    $('#k-name').focus({ preventScroll: true });
  }

  return { ar, get, set, DEMO, LIMIT, account, kids, signedIn, isPhone, isEmail, taken, norm, age, years, signIn, register, addKid, signOut, mark, eyes, toast, kidForm, EYE };
})();
