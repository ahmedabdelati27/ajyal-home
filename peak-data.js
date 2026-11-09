// the competitions of «قمة الأبطال» as cards, shared by the web's peak and the phone's: what kind each is, how long it runs,
// and where the child stands. base: where the site's files are from the calling page ('' or '../'). Needs peak.js.
const PeakBoard = (() => {
  const { COMPS, visible, isOpen, left, ago, ar, mine, winner } = Peak;

  // where the child stands in a competition
  function status(c) {
    const m = mine(c.id), open = isOpen(c);
    if (c.kind === 'quiz') {
      const r = m.result || c.done;
      if (r) return { cls: 'ok', text: `شاركت · نتيجتك ${ar(r.score)} من ١٠٠`, cta: 'شاهد نتيجتك' };
      return open ? { cls: '', text: 'لم تشارك بعد', cta: 'ابدأ المسابقة' } : { cls: '', text: 'لم تشارك فيها', cta: 'تفاصيل المسابقة' };
    }
    const win = !open && winner(c);
    if (!open) return c.me ? { cls: win.id === c.me ? 'win' : 'ok', text: win.id === c.me ? '🏆 فازت مشاركتك!' : `حصلت مشاركتك على ${ar(c.entries.find((e) => e.id === c.me).votes)} صوتاً · الفائزة: ${win.name}`, cta: 'شاهد النتيجة' }
      : { cls: '', text: `الفائزة: مشاركة ${win.name}`, cta: 'شاهد النتيجة' };
    if (m.entry) return { cls: m.entry.state === 'review' ? 'wait' : 'ok', text: { review: 'مشاركتك تحت المراجعة', live: 'مشاركتك في التصويت', rejected: 'لم تُعتمد مشاركتك' }[m.entry.state], cta: m.vote ? 'شاهد المشاركات' : 'صوّت لمشاركة' };
    return { cls: '', text: 'لم تشارك بعد', cta: 'شارك الآن' };
  }

  function card(c, base) {
    const s = status(c), on = isOpen(c);
    return { id: c.id, on, href: `${base}${c.kind === 'quiz' ? 'quiz' : 'contest'}.html?c=${c.id}`, cover: `${base}img/peak/${c.cover}.jpg`,
      type: c.kind === 'quiz' ? '⏱ مسابقة سريعة' : c.mine === 'story' ? '📖 مسابقة مستمرة' : '🎨 مسابقة مستمرة',
      name: c.name, about: c.about, when: on ? left(c) : ago(c), people: `👥 ${ar(c.people)} مشاركاً`, me: s.text, cls: s.cls, cta: s.cta };
  }

  // the running ones and the ended ones (a competition not started yet, or switched off by the admin, is not shown)
  const lists = (base = '') => ({ open: COMPS.filter(isOpen).map((c) => card(c, base)), ended: COMPS.filter((c) => visible(c) && !isOpen(c)).map((c) => card(c, base)) });

  return { lists };
})();
