// what the admin puts in each category of the Knowledge Forest, shared by the web's forest and the phone's;
// the icon and its colour say what each thing is. base: where the site's files are from the calling page ('' or '../').
const Forest = (() => {
  const KINDS = {
    video: { src: 'img/forest/I-14.png', c: '#8E5BE8', name: 'فيديو' },
    audio: { src: 'img/forest/I-12.png', c: '#EC6A93', name: 'صوت' },
    pics: { src: 'img/forest/I-19.png', c: '#2EA3D9', name: 'صور' },
    book: { src: 'img/forest/I-11.png', c: '#E8742B', name: 'كتاب' },
    flip: { src: 'img/forest/I-13.png', c: '#E8742B', name: 'كتاب تفاعلي' }
  };
  function shelves(base = '') {
    const K = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, { ...v, src: base + v.src }]));
    const c = (title, kind, t, meta, more = {}) => ({ title, kind, img: `${base}img/forest/t${t}.jpg`, kinds: [K[kind]], meta, clock: kind === 'video' || kind === 'audio', ...more,
      href: more.href && base + more.href,
      label: [title, K[kind].name, meta.replace(/ د$/, ' دقائق'), more.tag === 'done' ? 'مكتمل' : more.tag === 'new' ? 'جديد' : more.p ? 'جاري' : ''].filter(Boolean).join('، ') });
    return [
      { id: 'animals', title: 'عالم الحيوان', count: 18, items: [
        c('كيف تطير الطيور؟', 'video', '01', '8 د', { href: 'video.html', p: '42%' }),
        c('أصوات الغابة', 'audio', '02', '5 د', { href: 'audio.html', tag: 'done' }),
        c('صغار الحيوانات', 'pics', '03', '12 صورة', { href: 'pictures.html', tag: 'new' }),
        c('البومة الحكيمة', 'book', '04', '10 صفحات', { href: 'book.html' }),
        c('رحلة النحلة', 'video', '05', '6 د')] },
      { id: 'space', title: 'الفضاء والكواكب', count: 14, items: [
        c('كواكب مجموعتنا الشمسية', 'video', '06', '7 د', { tag: 'new' }),
        c('لماذا يتغير شكل القمر؟', 'flip', '07', '12 صفحة', { href: 'flipbook.html', p: '50%' }),
        c('صور من الفضاء', 'pics', '08', '15 صورة'),
        c('أغنية الكواكب', 'audio', '09', '3 د', { tag: 'done' }),
        c('رائد فضاء صغير', 'video', '10', '9 د')] },
      { id: 'body', title: 'جسم الإنسان', count: 12, items: [
        c('أسناني اللامعة', 'video', '11', '4 د', { tag: 'done' }),
        c('كيف نتنفس؟', 'book', '12', '8 صفحات'),
        c('حواسنا الخمس', 'pics', '13', '10 صور'),
        c('قلبي ينبض', 'audio', '14', '4 د'),
        c('الغذاء الصحي', 'video', '15', '6 د', { tag: 'new' })] }
    ];
  }
  return { shelves };
})();
