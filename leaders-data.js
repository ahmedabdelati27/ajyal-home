// the general leaderboard as the web's page and the phone's show it: one list by total points (profile.js), with
// child-friendly data only. base: where the site's files are from the calling page ('' or '../').
const Leaders = (() => {
  function board(base = '') {
    const { LEADERS, ME_RANK, BADGES } = Profile;
    const me = Profile.read();
    const badge = (id) => BADGES.find((b) => b.id === id)?.n || '';
    // the pictures and the badge's name, ready for the page
    const dress = (p, mine = false) => ({ ...p, mine, img: `${base}img/avatars/${p.avatar}.png`,
      badgeImg: p.badge ? `${base}img/badges/${p.badge}.png` : '', badgeName: p.badge ? badge(p.badge) : '' });
    const mine = { rank: ME_RANK, name: me.name, avatar: me.avatar, xp: me.xp, badge: 'S-06' };
    // the first three on their steps, read in order 1, 2, 3
    const podium = LEADERS.slice(0, 3).map((p) => dress(p.rank === ME_RANK ? mine : p));
    // the top ten, then the child's own place with the one just above when it is further down; a child in the top ten is lit in place
    const rows = LEADERS.slice(3, 10).map((p) => (p.rank === ME_RANK ? dress(mine, true) : dress(p)));
    if (ME_RANK > 10) {
      if (ME_RANK > 12) rows.push({ gap: true });
      if (LEADERS[ME_RANK - 2] && ME_RANK > 11) rows.push(dress(LEADERS[ME_RANK - 2]));
      rows.push(dress(mine, true));
    }
    return { podium, rows, rank: ME_RANK };
  }
  return { board };
})();
